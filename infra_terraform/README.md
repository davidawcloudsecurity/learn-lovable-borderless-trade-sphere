### How to import resources that already exist
You're seeing **Terraform resource creation errors** because the named resources already exist in AWS. The errors indicate a **conflict due to resource name reuse** (e.g., IAM roles, ELB target groups, RDS subnet groups). To resolve this cleanly, **you should import the existing resources into your Terraform state** instead of trying to recreate them.

---

### 🔧 **How to Fix: Import Existing Resources**

You can use the `terraform import` command to import these existing AWS resources into your Terraform state so Terraform manages them without trying to recreate them.

Here are the steps and import commands for each error you encountered:

---

#### 1. 🛡️ IAM Role `ec2_ssm_role`

**Error**: `EntityAlreadyExists: Role with name ec2_ssm_role already exists.`

```bash
terraform import aws_iam_role.ec2_ssm_role ec2_ssm_role
```

---

#### 2. 🎯 Target Group `frontend-tg`

**Error**: `ELBv2 Target Group (frontend-tg) already exists.`

You need the **ARN** of the existing target group. Get it via the AWS Console or CLI:

```bash
aws elbv2 describe-target-groups --names frontend-tg
```

Then import:

```bash
terraform import aws_lb_target_group.frontend arn:aws:elasticloadbalancing:region:account-id:targetgroup/frontend-tg/xxxxxxxxxxxxxxx
```

---

#### 3. 🎯 Target Group `backend-tg`

Same as above:

```bash
aws elbv2 describe-target-groups --names backend-tg
```

Then:

```bash
terraform import aws_lb_target_group.backend arn:aws:elasticloadbalancing:region:account-id:targetgroup/backend-tg/yyyyyyyyyyyyyyy
```

---

#### 4. 🛢️ RDS Subnet Group `postgres-subnet-group`

**Error**: `DBSubnetGroupAlreadyExists: The DB subnet group 'postgres-subnet-group' already exists.`

```bash
terraform import aws_db_subnet_group.postgres_subnet_group postgres-subnet-group
```

---

### ✅ After Importing:

1. Run `terraform plan` to verify Terraform recognizes the imported resources.
2. If necessary, update the resource blocks to exactly match the existing configuration.
3. Make sure there are no drift issues or mismatches in parameters.

---

Would you like help writing or verifying any of those resource blocks to ensure they match the imported resources?


# challenge-cloudresume-aws-level-1
How To Setup A 3 Tier Web Architecture With NGINX, Wordpress and MSSQL Using EC2 Instance
```bash
tail -v /var/log/cloud-init-output.log
```
## Run this if running at cloudshell
```ruby
alias tf="terraform"; alias tfa="terraform apply --auto-approve"; alias tfd="terraform destroy --auto-approve"; alias tfm="terraform init; terraform fmt; terraform validate; terraform plan";sudo yum install -y yum-utils shadow-utils; sudo yum-config-manager --add-repo https://rpm.releases.hashicorp.com/AmazonLinux/hashicorp.repo; sudo yum -y install terraform; terraform init
```
### Run npm preview with specific port
```
npm run preview -- --port=8080
```
## How to install Wordpress, nginx, and mariadb in AWS Linux2
Nginx
```bash
#!/bin/bash

apt install net-tools
wp_server=<change me>
apt install -y nginx
systemctl enable nginx

# Create NGINX config file
sudo bash -c "cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80;
    server_name localhost;

    location / {
        proxy_pass http://${wp_server}:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Connection \"\";
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF"

# Restart Nginx to apply changes
systemctl restart nginx

# Ensure ports are open in firewall (if ufw is used)
ufw allow 80/tcp
ufw allow 3000/tcp

response=$(curl -v localhost:3000 2>&1)

if echo "$response" | grep -q -E "Host localhost:3000 was resolved.|IPv6: ::1|IPv4: 127.0.0.1|Trying \[::1\]:3000...|Connected to localhost \(::1\) port 3000|GET / HTTP/1.1|Host: localhost:3000|User-Agent: curl/8.5.0|Accept: \*/\*|HTTP/1.1 302 Found|Server: Apache/2.4.58 \(Ubuntu\)|Location: http://localhost:3000/wp-admin/install.php"; then
  echo "Connecting to ${wp_server}:3000 is successful."
else
  echo "Failed to connect to ${wp_server}:3000."
fi
```
```bash
sudo amazon-linux-extras install php7.4
sudo yum install -y mariadb-server
```
mariadb
```bash
#!/bin/bash
apt install net-tools
# Variables
db_name="wp_$(date +%s)"
db_user=$db_name
db_password=$(date | md5sum | cut -c 1-12)
mysql_root_password=$(date | md5sum | cut -c 1-12)

# Save credentials to a file
cat > /tmp/db_credentials <<EOF
db_name=${db_name}
db_user=${db_user}
db_password=${db_password}
mysql_root_password=${mysql_root_password}
EOF
chmod 600 /tmp/db_credentials

# Update and install necessary packages
apt update -y
apt upgrade -y

# Install MariaDB
apt install -y mariadb-server mariadb-client
systemctl enable mariadb
systemctl start mariadb

# Secure MariaDB installation
mysql_secure_installation <<EOF

n
y
y
y
y
EOF

# Set up MySQL root password and create WordPress database and user
mysql -u root <<MYSQL_SCRIPT
ALTER USER 'root'@'localhost' IDENTIFIED BY '${mysql_root_password}';
CREATE DATABASE ${db_name};
CREATE USER '${db_user}'@'%' IDENTIFIED BY '${db_password}';
GRANT ALL PRIVILEGES ON ${db_name}.* TO '${db_user}'@'%';
FLUSH PRIVILEGES;
MYSQL_SCRIPT

# Check if database and user were created successfully
if mysql -u root -p${mysql_root_password} -e "USE ${db_name}"; then
    echo "Database '${db_name}' created successfully."
else
    echo "Database creation failed."
    exit 1
fi

# Store MySQL root password in ~/.my.cnf for easier access
cat > ~/.my.cnf <<EOF
[client]
user=root
password=${mysql_root_password}
EOF
chmod 600 ~/.my.cnf

# Backup the current configuration file
cp /etc/mysql/mariadb.conf.d/50-server.cnf /etc/mysql/mariadb.conf.d/50-server.cnf.bak

# Change the bind-address from 127.0.0.1 to 0.0.0.0
sed -i 's/^bind-address\s*=.*$/bind-address = 0.0.0.0/' /etc/mysql/mariadb.conf.d/50-server.cnf

# Restart MariaDB service to apply changes
systemctl restart mariadb

# Check the status of MariaDB service
if systemctl status mariadb | grep "active (running)"; then
    echo "MariaDB configuration updated successfully and service restarted."
else
    echo "Failed to restart MariaDB service. Please check the configuration."
    exit 1
fi

# Final checks
if systemctl status mariadb | grep "active (running)" && mysql -u root -p${mysql_root_password} -e "USE ${db_name}"; then
    # Print out installation details only if everything is successful
    echo "Database setup complete!"
    echo "Database Name: ${db_name}"
    echo "Database User: ${db_user}"
    echo "Database Password: ${db_password}"
    echo "MySQL root password: ${mysql_root_password}"
else
    echo "Database setup failed. Please check the logs for more information."
    exit 1
fi
```
```bash
# Grant access to the specific host
mysql -u root -p -e "GRANT ALL PRIVILEGES ON *.* TO 'root'@'192.168.0.29' IDENTIFIED BY 'your_password' WITH GRANT OPTION; FLUSH PRIVILEGES;"
```
Wordpress. Just remember to change db_name, db_user, db_password and mysql_root_password if you are using the cred from above
```bash
#!/bin/bash

apt install net-tools

# Variables
install_dir="/var/www/html"
db_name=<change me>
db_user=<change me>
db_password=<change me>
mysql_root_password=<change me>
db_host=<change me>

# Update and install necessary packages
apt update -y
apt upgrade -y

# Install Apache
apt install -y apache2
systemctl enable apache2
systemctl start apache2

# Change Apache to run on port 3000
sed -i 's/80/3000/g' /etc/apache2/ports.conf
sed -i 's/:80/:3000/g' /etc/apache2/sites-available/000-default.conf

# Restart Apache to apply port change
systemctl restart apache2

# Check if Apache is running
if systemctl status apache2 | grep "active (running)"; then
    echo "Apache is running on port 3000."
else
    echo "Apache failed to start."
    exit 1
fi

# Install PHP and required modules
apt install -y php libapache2-mod-php php-mysql php-cli php-curl php-xml php-mbstring php-gd

# Download and extract WordPress
mkdir -p ${install_dir}
cd /tmp
wget -q https://wordpress.org/latest.tar.gz
if [[ $? -ne 0 ]]; then
    echo "Failed to download WordPress."
    exit 1
fi

tar -xzf latest.tar.gz
mv wordpress/* ${install_dir}

# Check if WordPress files are in place
if [ -d "${install_dir}" ]; then
    echo "WordPress files extracted successfully."
else
    echo "WordPress extraction failed."
    exit 1
fi

# Set permissions
chown -R www-data:www-data ${install_dir}
chmod -R 755 ${install_dir}

# Configure WordPress wp-config.php
cp ${install_dir}/wp-config-sample.php ${install_dir}/wp-config.php

# Update wp-config.php with DB details
sed -i "s/database_name_here/${db_name}/" ${install_dir}/wp-config.php
sed -i "s/username_here/${db_user}/" ${install_dir}/wp-config.php
sed -i "s/password_here/${db_password}/" ${install_dir}/wp-config.php
sed -i "s/localhost/${db_host}/" ${install_dir}/wp-config.php

# Add security keys (salts) to wp-config.php
curl -s https://api.wordpress.org/secret-key/1.1/salt/ >> ${install_dir}/wp-config.php

# Enable Apache mods for WordPress (rewrite for pretty permalinks)
a2enmod rewrite
sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

apt install -y mariadb-server mariadb-client

# Install WP-CLI
curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
chmod +x wp-cli.phar
mv wp-cli.phar /usr/local/bin/wp

# Install WordPress using WP-CLI
cd ${install_dir}
admin_user="admin"
# Change this to a secure password
admin_password="P@ssw0rd123!" 
# Change this to a valid email
admin_email="admin@example.com"
wp core install --url="http://localhost" --title="My WordPress Site" --admin_user=${admin_user} --admin_password=${admin_password} --admin_email=${admin_email} --allow-root

rm -rf ${install_dir}/index.html

# Install theme
# cd ${install_dir}
wp theme install https://downloads.wordpress.org/theme/spectra-one.1.1.5.zip --activate --allow-root

# Restart Apache to apply changes
systemctl restart apache2

# Ensure port 3000 is open in firewall (if ufw is used)
ufw allow 3000/tcp

# Final installation checks
if systemctl status apache2 | grep "active (running)" && mysql -h ${db_host} -u ${db_user} -p${mysql_root_password} -e "USE ${db_name}"; then
    # Print out installation details only if everything is successful
    echo "Installation complete!"
    echo "WordPress has been installed in ${install_dir}"
    echo "Database Host: ${db_host}"
    echo "Database Name: ${db_name}"
    echo "Database User: ${db_user}"
    echo "Database Password: ${db_password}"
    echo "MySQL root password: ${mysql_root_password}"
    echo "Apache is running on port 3000"
else
    echo "Installation failed. Please check the logs for more information."
    exit 1
fi
```
## Troubleshoot
Use this if url gets redirected
```bash

```
