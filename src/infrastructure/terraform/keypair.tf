// "aws_key_pair" = type of the resource
// "deployer" = the name of the resource
resource "aws_key_pair" "intimacy-key" {
  key_name   = "intimacy-key"
  public_key = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIE0Kg+TsdRusk7QviiQaYujgXOWUjop9EDvVUeziZiqk salimhassanmohamed@Host-001.lan"

  // Create the ssh key from terminal: ssh-keygen
  // Then copy the public key
}