#!/bin/sh

# -- Configure kernel and system limits (required by Elasticsearch inside SonarQube) --
echo "vm.max_map_count=262144" >> /etc/sysctl.conf      # Increase max virtual memory areas
echo "fs.file-max=65536" >> /etc/sysctl.conf            # Set max file descriptors
sysctl -p                                                # Apply sysctl changes

# -- Set SonarQube user limits for file descriptors and processes --
echo "sonarqube   -   nofile   65536" >> /etc/security/limits.conf
echo "sonarqube   -   nproc    4096" >> /etc/security/limits.conf

# -- Install Java, required dependencies, and system tools --
apt-get update -y
apt-get install -y openjdk-17-jdk unzip wget gnupg2 nginx postgresql postgresql-contrib

# -- Set up PostgreSQL (SonarQube uses it to persist analysis data) --
systemctl enable postgresql
systemctl start postgresql
echo "postgres:admin123" | chpasswd                      # Set password for postgres user
sudo -u postgres createuser sonar                        # Create sonar DB user
sudo -u postgres psql -c "ALTER USER sonar WITH ENCRYPTED PASSWORD 'admin123';"
sudo -u postgres psql -c "CREATE DATABASE sonarqube OWNER sonar;"  # Create DB for SonarQube

# -- Download and extract SonarQube --
mkdir -p /opt
cd /opt
wget https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-9.9.7.96285.zip
unzip sonarqube-9.9.7.96285.zip
mv sonarqube-9.9.7.96285 sonarqube                      # Rename folder for simplicity

# -- Create sonar user and assign permissions --
groupadd sonar
useradd -c "SonarQube User" -d /opt/sonarqube -g sonar sonar
chown -R sonar:sonar /opt/sonarqube                     # Give sonar user full access

# -- Configure SonarQube DB connection and web server settings --
cat <<EOF > /opt/sonarqube/conf/sonar.properties
sonar.jdbc.username=sonar
sonar.jdbc.password=admin123
sonar.jdbc.url=jdbc:postgresql://localhost/sonarqube
sonar.web.host=0.0.0.0
sonar.web.port=9000
sonar.log.level=INFO
EOF

# -- Create systemd service to manage SonarQube as a background process --
cat <<EOF > /etc/systemd/system/sonarqube.service
[Unit]
Description=SonarQube service
After=network.target

[Service]
Type=forking
ExecStart=/opt/sonarqube/bin/linux-x86-64/sonar.sh start
ExecStop=/opt/sonarqube/bin/linux-x86-64/sonar.sh stop
User=sonar
Group=sonar
Restart=always
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
EOF

# -- Enable and reload the new SonarQube service --
systemctl daemon-reexec
systemctl daemon-reload
systemctl enable sonarqube

# -- Configure NGINX as a reverse proxy for SonarQube (so it's available on port 80) --
rm -f /etc/nginx/sites-enabled/default /etc/nginx/sites-available/default
cat <<EOF > /etc/nginx/sites-available/sonarqube
server {
    listen 80;
    server_name localhost;

    location / {
        proxy_pass http://127.0.0.1:9000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto http;
    }
}
EOF

# -- Enable the SonarQube NGINX site and restart the service --
ln -s /etc/nginx/sites-available/sonarqube /etc/nginx/sites-enabled/sonarqube
systemctl enable nginx
systemctl restart nginx

# -- Allow necessary ports for HTTP and SonarQube Web UI --
ufw allow 80
ufw allow 9000

# -- Optional: reboot the system to ensure changes take effect --
sleep 10
reboot
