resource "aws_instance" "jenkins" {
  # The ami is the Amazon Machine Image that will be used to create the instance
  ami = data.aws_ami.amiID.id
  # The instance type is the type of the instance that will be created
  instance_type = "t2.small"

  # The key pair name is the name of the key pair that will be used to connect to the instance
  key_name = var.public_key // They key pair name 
  # The key pair should be defined in the parent module and passed as a variable
  # to this module. Make sure to define this variable in the parent module
  # and pass the key pair name when calling this module.
  vpc_security_group_ids = [aws_security_group.jenkins-sg.id] // The security group id
  # The security group should be defined in the parent module and passed as a variable
  # to this module. Make sure to define this variable in the parent module
  availability_zone = var.zone1
  # The availability zone is the zone where the instance will be created
  # The user_data is the script that will be executed when the instance is created
  # It is used to install and configure Jenkins
  # The script should be defined in the parent module and passed as a variable
  user_data = file("${path.module}/bash/jenkins.sh")

  tags = {
    # The tags are used to identify the instance
    # They can be used to filter instances in the AWS console
    Name = "Jenkins-instance"
  }
}