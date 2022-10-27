resource "cloudflare_record" "api_cname_record" {
  zone_id = var.CLOUDFLARE_ZONE_ID
  name    = "wwww.prixfixe.dev"
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
      }
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale" = "1"
      }
    }
  }
}
