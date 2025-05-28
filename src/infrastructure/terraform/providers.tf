provider "aws" {
  region = var.region
}

provider "google" {
  project = "sublime-lyceum-461014-k8" # Replace with your GCP project ID
  region  = var.google-region
}
