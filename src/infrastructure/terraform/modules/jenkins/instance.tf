resource "aws_instance" "jenkins" {
  ami           = data.aws_ami.amiID.id
  instance_type = "t2.small"

  key_name               =  var.public_key // They key pair name 
  vpc_security_group_ids = [aws_security_group.jenkins-sg.id] // The security group id
  availability_zone      = var.zone1

  user_data = file("${path.module}/bash/jenkins.sh")

  tags = {
    Name = "Jenkins-instance"
  }

  # Copies the myapp.conf file to /etc/myapp.conf
  /*   provisioner "file" {
    source      = "jenkins.sh"
    destination = "/tmp/jenkins.sh"
  }
 */
  # Establishes connection to be used by all
  # generic remote provisioners (i.e. file/remote-exec)
  /*   connection {
    type        = "ssh"
    user        = var.jenkinsUser // Default user of this EC2 instance
    private_key = file("intimacykey")
    host        = self.public_ip // The public Ip of this instance
  }
 */
  /*   provisioner "remote-exec" {
    inline = [
      "chmod +x /tmp/jenkins.sh",
      "/tmp/jenkins.sh args",
    ]
  } */
}