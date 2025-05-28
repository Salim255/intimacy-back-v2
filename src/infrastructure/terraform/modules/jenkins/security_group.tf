resource "aws_security_group" "jenkins-sg" {
  name        = "jenkins-sg"
  description = "jenkins-sg"
  tags = {
    Name = "jenkins-sg"
  }
}

// Rules resources
// Inbound
resource "aws_vpc_security_group_ingress_rule" "sshfrommyIP" {
  // This rule allows SSH access from a specific IP address
  security_group_id = aws_security_group.jenkins-sg.id

  # Replace with your actual IP address
  # This IP address should be the one you use to connect to the Jenkins instance
  # It is recommended to use a /32 CIDR notation for a single IP address
  # This will restrict access to only your IP address
  cidr_ipv4 = "90.110.234.190/32"

  from_port   = 22    // For ssh
  ip_protocol = "tcp" // ssh protocol
  to_port     = 22
}

resource "aws_vpc_security_group_ingress_rule" "allow_http" {
  security_group_id = aws_security_group.jenkins-sg.id
  cidr_ipv4         = "0.0.0.0/0" // any where
  from_port         = 8080
  ip_protocol       = "tcp"
  to_port           = 8080
}


// Outbound
resource "aws_vpc_security_group_egress_rule" "allowAllOutbound_ipv4" {
  security_group_id = aws_security_group.jenkins-sg.id
  cidr_ipv4         = "0.0.0.0/0" // To any where
  ip_protocol       = "-1"        # semantically equivalent to all ports
}

resource "aws_vpc_security_group_egress_rule" "allowAllOutbound_ipv6" {
  security_group_id = aws_security_group.jenkins-sg.id
  cidr_ipv6         = "::/0"
  ip_protocol       = "-1" # semantically equivalent to all ports
}