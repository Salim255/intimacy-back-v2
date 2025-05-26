# This file defines the Google Kubernetes Engine (GKE) cluster resource.
# Create the GKE cluster resource.
resource "google_container_cluster" "intimacy-cluster" {
  # Name of your cluster - must be unique within your GCP project & region.
  name = "intimacy-cluster"

  # Location can be a zone or region where the cluster will be created.
  location = var.google-zone1

  # Remove the default node pool that GKE creates automatically.
  # We do this because we want to manage node pools separately (more control).
  remove_default_node_pool = true

  # This is a required field but will be ignored because of the above setting.
  initial_node_count       = 1
}