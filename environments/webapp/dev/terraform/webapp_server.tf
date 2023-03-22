locals {
  web_location = "www.prixfixe.dev"
}

resource "cloudflare_record" "webapp_cname_record" {
  zone_id = var.CLOUDFLARE_ZONE_ID
  name    = local.web_location
  type    = "CNAME"
  value   = "ghs.googlehosted.com"
  ttl     = 1
  proxied = true
}

resource "google_project_iam_custom_role" "webapp_server_role" {
  role_id     = "webapp_server_role"
  title       = "Webapp server role"
  description = "An IAM role for the Webapp server"
  permissions = [
    "secretmanager.versions.access",
    "cloudtrace.traces.patch",
    "logging.buckets.create",
    "logging.buckets.write",
    "logging.buckets.list",
    "logging.buckets.get",
  ]
}

resource "google_service_account" "webapp_user_service_account" {
  account_id   = "webapp-server"
  display_name = "Webapp Server"
}

resource "google_project_iam_member" "webapp_user" {
  project = local.project_id
  role    = google_project_iam_custom_role.webapp_server_role.id
  member  = format("serviceAccount:%s", google_service_account.webapp_user_service_account.email)
}

resource "google_project_iam_binding" "webapp_user_service_account_user" {
  project = local.project_id
  role    = "roles/iam.serviceAccountUser"

  members = [
    google_project_iam_member.webapp_user.member,
  ]
}

resource "google_project_iam_binding" "webapp_user_cloud_run_admin" {
  project = local.project_id
  role    = "roles/run.admin"

  members = [
    google_project_iam_member.webapp_user.member,
  ]
}

# this allows the service to be on the public internet
data "google_iam_policy" "public_access" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}

resource "google_cloud_run_service_iam_policy" "public_access" {
  location = google_cloud_run_service.webapp_server.location
  project  = google_cloud_run_service.webapp_server.project
  service  = google_cloud_run_service.webapp_server.name

  policy_data = data.google_iam_policy.public_access.policy_data
}


resource "google_cloud_run_service" "webapp_server" {
  name     = "webapp-server"
  location = local.gcp_region

  traffic {
    percent         = 100
    latest_revision = true
  }

  autogenerate_revision_name = true

  template {
    spec {
      service_account_name = google_service_account.webapp_user_service_account.email

      containers {
        image = "gcr.io/prixfixe-dev/webapp_server"

        env {
          name  = "RUNNING_IN_GOOGLE_CLOUD_RUN"
          value = "true"
        }

        env {
          name  = "PF_ENVIRONMENT"
          value = "dev"
        }

        env {
          name  = "GOOGLE_CLOUD_SECRET_STORE_PREFIX"
          value = format("projects/%d/secrets", data.google_project.project.number)
        }

        env {
          name  = "GOOGLE_CLOUD_PROJECT_ID"
          value = data.google_project.project.project_id
        }

        env {
          name = "NEXT_PUBLIC_SEGMENT_API_TOKEN"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.segment_api_token.secret_id
              key  = "latest"
            }
          }
        }
      }
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale" = "1"
      }
    }
  }
}

resource "google_cloud_run_domain_mapping" "webapp_domain_mapping" {
  location = local.gcp_region
  name     = local.web_location

  metadata {
    namespace = local.project_id
  }

  spec {
    route_name = google_cloud_run_service.webapp_server.name
  }
}

resource "cloudflare_page_rule" "www_forward" {
  zone_id  = var.CLOUDFLARE_ZONE_ID
  target   = "https://prixfixe.dev/*"
  priority = 1

  actions {
    forwarding_url {
      url         = "https://www.prixfixe.dev/$1"
      status_code = 301
    }
  }
}

resource "google_monitoring_service" "webapp_service" {
  service_id   = "webapp-service"
  display_name = "Webapp Service"

  basic_service {
    service_type = "CLOUD_RUN"
    service_labels = {
      service_name = google_cloud_run_service.webapp_server.name
      location     = local.gcp_region
    }
  }
}

resource "google_monitoring_slo" "webapp_server_latency_slo" {
  service = google_monitoring_service.webapp_service.service_id

  slo_id          = "webapp-server-latency-slo"
  goal            = 0.999
  calendar_period = "DAY"
  display_name    = "Webapp Server Latency"

  basic_sli {
    latency {
      threshold = "1s"
    }
  }
}

resource "google_monitoring_slo" "webapp_server_availability_slo" {
  service = google_monitoring_service.webapp_service.service_id

  slo_id          = "webapp-server-availability-slo"
  goal            = 0.999
  calendar_period = "DAY"
  display_name    = "Webapp Server Availability"

  basic_sli {
    availability {
      enabled = true
    }
  }
}

resource "google_monitoring_uptime_check_config" "webapp_uptime_check" {
  display_name = "webapp-server-uptime-check"
  timeout      = "60s"
  period       = "300s"

  http_check {
    path         = "/"
    port         = "443"
    use_ssl      = true
    validate_ssl = true
  }

  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = local.project_id
      host       = local.web_location
    }
  }
}


resource "google_monitoring_alert_policy" "webapp_server_latency_alert_policy" {
  display_name = "Webapp Server Latency Alert Policy"
  combiner     = "OR"

  conditions {
    display_name = "request latency"
    condition_monitoring_query_language {
      duration = ""
      query    = <<END
        fetch uptime_url
        | metric 'monitoring.googleapis.com/uptime_check/request_latency'
        | filter (metric.checked_resource_id == 'www.prixfixe.dev')
        | group_by 5m, [value_request_latency_max: max(value.request_latency)]
        | every 5m
        | group_by [], [value_request_latency_max_max: max(value_request_latency_max)]
        | group_by [],
            [value_request_latency_max_max_mean: mean(value_request_latency_max_max)]
        | condition val() > 999 'ms'
      END
    }
  }
}

resource "google_monitoring_alert_policy" "webapp_server_memory_usage_alert_policy" {
  display_name = "Webapp Server Memory Usage"
  combiner     = "OR"
  conditions {
    display_name = "Webapp Server Memory Utilization"

    condition_threshold {
      filter     = "resource.type = \"cloud_run_revision\" AND (resource.labels.service_name = \"webapp-server\") AND metric.type = \"run.googleapis.com/container/memory/utilizations\""
      duration   = "300s"
      comparison = "COMPARISON_GT"
      aggregations {
        alignment_period   = "300s"
        per_series_aligner = "ALIGN_PERCENTILE_99"
      }
      trigger {
        count = 1
      }
      threshold_value = 0.8
    }
  }

  alert_strategy {
    auto_close = "259200s"
  }
}
