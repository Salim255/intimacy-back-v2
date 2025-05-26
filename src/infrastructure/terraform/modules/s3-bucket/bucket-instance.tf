resource "aws_s3_bucket" "user_images" {
  bucket = "intimacy-bucket-s3"

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Name        = "User Images Bucket"
    Environment = "Development"
  }
}
