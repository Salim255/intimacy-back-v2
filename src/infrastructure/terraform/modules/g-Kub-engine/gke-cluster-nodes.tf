# Define a separate node pool for your cluster.
resource "google_container_node_pool" "intimacy-cluster_preemptible_nodes"{
  # Name of the node pool (unique within the cluster).
  name       = "intimacy-node-pool"

  # Location (must match cluster location).
  location   = var.google-region

  # Link this node pool to the cluster defined above.
  cluster    = google_container_cluster.intimacy-cluster.name

  # Number of nodes in this node pool.
  node_count = 1

  node_config {
    # Use preemptible instances (cheaper but can be terminated by Google at any time).
    preemptible  = true

    # The machine type for each node (defines CPU, RAM, etc).
    machine_type = "e2-medium"

    # Assign the custom service account to these nodes.
    # This controls what GCP permissions the nodes have.
    service_account = google_service_account.default.email
    # The service account must have the necessary permissions to access GCP resources.

    # OAuth scopes define the API access level for the nodes.
    oauth_scopes    = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}