#!/bin/bash

set -euxo pipefail  # Safer scripting: exit on error, show commands

# Update and upgrade packages
sudo apt update
sudo apt upgrade -y

# Install Node.js 20 (required by your Node project)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

sudo mkdir -p /opt/nodejs-20
sudo ln -s /usr/bin/node /opt/nodejs-20/node
sudo ln -s /usr/bin/npm /opt/nodejs-20/npm
# Add Node.js to PATH

# Install Java 17 and 21 (required by Jenkins)
sudo apt install -y openjdk-17-jdk openjdk-21-jdk

# Install Maven, wget, unzip
sudo apt install -y maven wget unzip

sudo snap install aws-cli --classic -y

# Add Docker's official GPG key:
sudo apt-get update -y
sudo apt-get install ca-certificates curl -y
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc 
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y

# Add Jenkins key and repository
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null

# Update again after adding Jenkins repo
sudo apt update

# Install Jenkins
sudo apt install -y jenkins

# add Jenkins user in the Docker group.
usermod -a -G docker jenkins

# Enable and start Jenkins service
sudo systemctl enable jenkins
sudo systemctl start jenkins
