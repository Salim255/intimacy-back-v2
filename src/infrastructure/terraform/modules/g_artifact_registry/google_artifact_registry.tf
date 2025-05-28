resource "google_artifact_registry_repository" "docker_repo" {
  location      = var.google-region       # region, e.g. us-central1, europe-west1
  repository_id = "intimacy-backend-repo" # your repo name
  description   = "Docker repository for NestJS app"
  format        = "DOCKER"
}