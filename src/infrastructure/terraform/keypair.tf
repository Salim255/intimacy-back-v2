// "aws_key_pair" = type of the resource
// "intimacy-key" = the name of the resource
resource "aws_key_pair" "intimacy-key" {
  key_name   = "intimacy-key"
  public_key = file("intimacykey.pub")

  // Create the ssh key from terminal: ssh-keygen
  // Then copy the public key
}