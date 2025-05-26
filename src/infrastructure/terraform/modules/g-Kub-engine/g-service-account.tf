# Create a Google Cloud service account to be used by your GKE nodes.
# This service account controls what permissions the nodes have on GCP resources.
resource "google_service_account" "default" {
  # account_id is a unique identifier for this service account (used in the email).
  # It should be lowercase, alphanumeric, and can include dashes.
  # This value is up to you to choose, typically related to your project or purpose.
  account_id   = "fresh-arcade-461008-t0"  

  # display_name is a friendly name shown in the GCP Console to identify this account.
  display_name = "terraform-admin"
}
