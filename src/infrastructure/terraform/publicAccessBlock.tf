resource "aws_s3_bucket_public_access_block" "user_images_public_access" {
  bucket = aws_s3_bucket.user_images.bucket

  block_public_acls       = false
  ignore_public_acls      = false
  block_public_policy     = false
}