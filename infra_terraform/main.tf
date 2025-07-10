variable "region" {
  description = "AWS region"
  default     = "us-east-1"
}

variable "ami" {
  description = "Amazon Linux 2 AMI ID"
  default     = "ami-02c21308fed24a8ab" # Amazon Linux 2 AMI (HVM) - Kernel 5.10, SSD Volume Type in us-east-1
}

variable "ami_ubuntu" {
  description = "ubuntu-jammy-22.04 AMI ID"
  default     = "ami-0a7d80731ae1b2435" # ubuntu-jammy-22.04
}

variable "ami_windows2019" {
  description = "windows2019 AMI ID"
  default     = "ami-0ed9f8d63c9e8b95a"
}

# Data sources for existing infrastructure
data "aws_vpc" "existing" {
  id = "vpc-0b3556a25e5d65182"
}

data "aws_subnet" "wordpress-1a" {
  id = "subnet-06f8090a56fb14713"
}

data "aws_subnet" "wordpress-1b" {
  id = "subnet-0782e8b53d6067a2b"
}

provider "aws" {
  region  = var.region
}

# Security Groups - using existing VPC
resource "aws_security_group" "public_facing" {
  name        = "allow_http_ssh"
  description = "Allow HTTP and SSH inbound traffic"
  vpc_id      = data.aws_vpc.existing.id

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "allow_http_ssh"
  }
}

resource "aws_security_group" "private_app" {
  name        = "allow_nginx"
  description = "Allow HTTP inbound traffic within VPC"
  vpc_id      = data.aws_vpc.existing.id

  ingress {
    description = "HTTP from public subnet"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    security_groups = [aws_security_group.public_facing.id]
  }

  ingress {
    description = "Setup to allow SSM"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "allow_nginx"
  }
}

resource "aws_security_group" "private_db" {
  name        = "allow_wordpress"
  description = "Allow HTTP inbound traffic within VPC"
  vpc_id      = data.aws_vpc.existing.id

  ingress {
    description = "API access from public subnet"
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    security_groups = [aws_security_group.public_facing.id]
  }  

  ingress {
    description = "MYSQL/Aurora from private subnet app tier"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    self        = true
  }

  egress {
    description = "HTTPS for SSM"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "HTTP for SSM"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "allow_wordpress"
  }
}

# IAM Role for EC2 Instances
resource "aws_iam_role" "ec2_ssm_role" {
  name = "ec2_ssm_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ssm_policy_attachment" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
  role       = aws_iam_role.ec2_ssm_role.name
}

resource "aws_iam_instance_profile" "ec2_ssm_profile" {
  name = "ec2_ssm_profile"
  role = aws_iam_role.ec2_ssm_role.name
}

# ALB - using existing subnets
resource "aws_lb" "example" {
  name               = "example-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.public_facing.id]
  subnets            = [
    data.aws_subnet.wordpress-1a.id,
    data.aws_subnet.wordpress-1b.id
  ]

  enable_deletion_protection = false

  tags = {
    Environment = "dev"
  }
}

resource "aws_lb_target_group" "frontend" {
  name     = "frontend-tg"
  port     = 8080
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.existing.id
}

resource "aws_lb_target_group" "backend" {
  name     = "backend-tg"
  port     = 3001
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.existing.id

  health_check {
    enabled             = true
    path                = "/api/search"
    interval            = 30
    timeout             = 5
    unhealthy_threshold = 2
    healthy_threshold   = 5
    matcher             = "200-399"
  }
}

resource "aws_lb_listener" "example" {
  load_balancer_arn = aws_lb.example.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

resource "aws_lb_listener_rule" "api_rule" {
  listener_arn = aws_lb_listener.example.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    path_pattern {
      values = ["/api*"]
    }
  }
}

# WORDPRESS LAUNCH TEMPLATE
resource "aws_launch_template" "wordpress" {
  name_prefix   = "wordpress-"
  image_id      = var.ami_windows2019
  instance_type = "t2.micro"
  vpc_security_group_ids = [aws_security_group.private_app.id]
  iam_instance_profile {
    name = aws_iam_instance_profile.ec2_ssm_profile.name
  }
  user_data = base64encode(<<-EOF
<powershell>
# Set error action
$ErrorActionPreference = "Stop"

# --- CONFIGURATION ---
$domainName = "corp.example.com"
$domainUser = "corp\Admin"
$domainPass = "p@ssw0rd!"

# --- Install AWS Tools for PowerShell if needed ---
if (-not (Get-Module -ListAvailable -Name 'AWSPowerShell')) {
    Write-Output "Installing AWS Tools for PowerShell..."
    Install-Package -Name AWSPowerShell -Force -Scope AllUsers
    Import-Module AWSPowerShell
}

if (-not $domainUser -or -not $domainPass) {
    Write-Output "ERROR: Domain credentials are empty."
    exit 1
}

# --- Prepare credentials object ---
$securePassword = ConvertTo-SecureString $domainPass -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential ($domainUser, $securePassword)

# --- Generate random hostname ---
$randomNumber = Get-Random -Minimum 90 -Maximum 101
$newHostname = "example$randomNumber"

Write-Output "Setting hostname to $newHostname..."
Rename-Computer -NewName $newHostname -Force -Restart:$false

# --- Join domain ---
Write-Output "Joining domain $domainName as $domainUser..."
try {
    Add-Computer -DomainName $domainName -Credential $cred -Force -Options JoinWithNewName,AccountCreate
    Write-Output "Successfully joined the domain. Restarting..."
    Restart-Computer -Force
} catch {
    Write-Output "ERROR: Failed to join the domain. $_"
    exit 2
}
</powershell>
EOF
  )
}

# MYSQL LAUNCH TEMPLATE
resource "aws_launch_template" "mysql" {
  name_prefix   = "mysql-"
  image_id      = var.ami_ubuntu
  instance_type = "t2.micro"
  vpc_security_group_ids = [aws_security_group.private_db.id]
  iam_instance_profile {
    name = aws_iam_instance_profile.ec2_ssm_profile.name
  }
  user_data = base64encode(<<-EOF
    #!/bin/bash
    apt update -y
    apt install -y docker.io
    systemctl start docker
    git clone -b supabase_auth_main https://github.com/davidawcloudsecurity/learn-lovable-borderless-trade-sphere.git
    cd learn-lovable-borderless-trade-sphere/
    sed -i "s/localhost/$(hostname -I | awk '{print $1}')/g" server.js
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    apt-get install -y nodejs
    npm install -y express cors
    node server.js &
    docker run -d -e MYSQL_ROOT_PASSWORD=rootpassword \
               -e MYSQL_DATABASE=wordpress \
               -e MYSQL_USER=wordpress \
               -e MYSQL_PASSWORD=wordpress \
               -p 3306:3306 mysql:5.7
  EOF
  )
}

# WORDPRESS AUTOSCALING GROUP - using existing subnets
resource "aws_autoscaling_group" "wordpress" {
  name                = "wordpress-asg"
  min_size            = 2
  max_size            = 4
  desired_capacity    = 2
  vpc_zone_identifier = [
    data.aws_subnet.wordpress-1a.id
  ]
  health_check_type   = "EC2"
  target_group_arns   = [aws_lb_target_group.frontend.arn]

  launch_template {
    id      = aws_launch_template.wordpress.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "wordpress-asg-instance"
    propagate_at_launch = true
  }

  lifecycle {
    create_before_destroy = true
  }
}

# MYSQL AUTOSCALING GROUP - using existing subnets
resource "aws_autoscaling_group" "mysql" {
  name                = "mysql-asg"
  min_size            = 1
  max_size            = 2
  desired_capacity    = 1
  vpc_zone_identifier = [
    data.aws_subnet.wordpress-1b.id
  ]
  health_check_type   = "EC2"
  target_group_arns   = [aws_lb_target_group.backend.arn]

  launch_template {
    id      = aws_launch_template.mysql.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "mysql-asg-instance"
    propagate_at_launch = true
  }

  lifecycle {
    create_before_destroy = true
  }
}
