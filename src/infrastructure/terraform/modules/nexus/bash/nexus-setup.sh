#!/bin/bash

# Import the Amazon Corretto (Java) GPG key for package verification
sudo rpm --import https://yum.corretto.aws/corretto.key
# Download and save the Corretto yum repository configuration to the system
sudo curl -L -o /etc/yum.repos.d/corretto.repo https://yum.corretto.aws/corretto.repo
# Install Amazon Corretto 17 (Java 17) development kit and wget tool using yum package manager
sudo yum install -y java-17-amazon-corretto-devel wget -y
# Create directory where Nexus will be installed
mkdir -p /opt/nexus/   
# Create temporary directory for downloading and extracting Nexus
mkdir -p /tmp/nexus/
# Change directory to the temp folder for Nexus installation files                           
cd /tmp/nexus/
# URL to the latest Nexus OSS tarball (compressed archive)

NEXUSURL="https://download.sonatype.com/nexus/3/nexus-3.80.0-06-linux-x86_64.tar.gz"
# Download the Nexus tarball from Sonatype and save it as nexus.tar.gz

wget $NEXUSURL -O nexus.tar.gz
# Pause for 10 seconds - giving time for the download to complete (not usually necessary, but sometimes used for stability)
sleep 10
# Extract the tarball and capture the output listing files/folders extracted
EXTOUT=`tar xzvf nexus.tar.gz`
# Extract the top-level directory name from the tar output (the folder created by extraction)
NEXUSDIR=`echo $EXTOUT | cut -d '/' -f1`
# Pause for 5 seconds - giving time for extraction to settle (also optional)
sleep 5
# Remove the downloaded tarball archive since extraction is done
rm -rf /tmp/nexus/nexus.tar.gz
# Copy everything extracted in temp folder to the target install directory
cp -r /tmp/nexus/* /opt/nexus/
sleep 5
# Create a new user 'nexus' to run the Nexus service (security best practice to avoid running as root)
useradd nexus
# Change ownership of the Nexus installation directory to the 'nexus' user and group
chown -R nexus.nexus /opt/nexus 
cat <<EOT>> /etc/systemd/system/nexus.service
[Unit]                                                                          
Description=nexus service                                                       
After=network.target                                                            
                                                                  
[Service]                                                                       
Type=forking                                                                    
LimitNOFILE=65536                                                               
ExecStart=/opt/nexus/$NEXUSDIR/bin/nexus start                                  
ExecStop=/opt/nexus/$NEXUSDIR/bin/nexus stop                                    
User=nexus                                                                      
Restart=on-abort                                                                
                                                                  
[Install]                                                                       
WantedBy=multi-user.target                                                      

EOT

echo 'run_as_user="nexus"' > /opt/nexus/$NEXUSDIR/bin/nexus.rc
systemctl daemon-reload
systemctl start nexus
systemctl enable nexus
