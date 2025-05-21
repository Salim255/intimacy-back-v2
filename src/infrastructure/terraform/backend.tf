terraform {
  backend "s3" {
    // The bucket name created in S3
    bucket = "terraform-backend-intimacy"
    // Key is the path name you give to your backend file in S3
    key    = "terraform/backend"
    region = "eu-west-3"
  }
}