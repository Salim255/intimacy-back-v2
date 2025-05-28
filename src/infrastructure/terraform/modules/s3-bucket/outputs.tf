// Output the access key and secret key for your application.
output "intimacy_user_access_key_id" {
  value     = aws_iam_access_key.intimacy_user_access_key.id
  sensitive = true
}

output "intimacy_user_secret_access_key" {
  value     = aws_iam_access_key.intimacy_user_access_key.secret
  sensitive = true
}
