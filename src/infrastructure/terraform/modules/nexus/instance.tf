resource "aws_instance" "nexus" {
  ami           = data.aws_ami.amiID.id
  instance_type = "t2.small"

  key_name               =  var.public_key // They key pair name 
  vpc_security_group_ids = [aws_security_group.nexus-sg.id] // The security group id
  availability_zone      = var.zone1

  user_data = file("${path.module}/bash/nexus-setup.sh")

  tags = {
    Name = "Nexus-instance"
  }
}