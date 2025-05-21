resource "aws_s3_bucket" "user_images" {
  bucket = "intimacy-s3"

  tags = {
    Name        = "User Images Bucket"
    Environment = "Development"
  }
}
