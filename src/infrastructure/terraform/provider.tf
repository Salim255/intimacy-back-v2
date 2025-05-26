provider "aws" {
  region = var.region
}

provider "google" {
  project = "intimacy-dev" # Replace with your GCP project ID
  region  = var.google-region
}
