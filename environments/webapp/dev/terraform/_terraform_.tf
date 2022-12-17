terraform {
  required_version = "1.3.4"

  cloud {
    organization = "prixfixe"

    workspaces {
      name = "dev-webapp"
    }
  }

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "3.27.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "4.43.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "2.2.0"
    }
  }
}