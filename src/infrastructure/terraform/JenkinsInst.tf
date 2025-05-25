resource "aws_instance" "jenkins" {
  ami           = data.aws_ami.amiID
  instance_type = "t3.micro"

  key_name = aws_key_pair.intimacy-key.key_name // They key pair name
  vpc_security_group_ids = [aws_security_group.jenkins-sg.id] // The security group id
  availability_zone = var.zone1

  tags = {
    Name = "Jenkins-instance"
  }
}