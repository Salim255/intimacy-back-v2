#!/bin/bash

set -euxo pipefail  # Safer scripting: exit on error, show commands

# Update and upgrade packages
sudo apt update
sudo apt upgrade -y

# Install Node.js 20 (required by your Node project)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Java 17 and 21 (required by Jenkins)
sudo apt install -y openjdk-17-jdk openjdk-21-jdk

# Install Maven, wget, unzip
sudo apt install -y maven wget unzip

# Add Jenkins key and repository
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null

# Update again after adding Jenkins repo
sudo apt update

# Install Jenkins
sudo apt install -y jenkins

# Enable and start Jenkins service
sudo systemctl enable jenkins
sudo systemctl start jenkins
