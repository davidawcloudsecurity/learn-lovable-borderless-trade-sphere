# Configure the AWS Provider
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region = "us-east-1"
}

# Generate an SSH key pair
resource "aws_key_pair" "deployer" {
  key_name   = "deployer-key"
  public_key = file("~/.ssh/id_rsa.pub") # Replace with your public key path
}

# Create a VPC
resource "aws_vpc" "main_vpc" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "main-vpc"
  }
}

# Create public subnets
resource "aws_subnet" "public_subnet_1" {
  vpc_id     = aws_vpc.main_vpc.id
  cidr_block = "10.0.1.0/24"
  availability_zone = "us-east-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "public-subnet-1"
  }
}

resource "aws_subnet" "public_subnet_2" {
  vpc_id     = aws_vpc.main_vpc.id
  cidr_block = "10.0.2.0/24"
  availability_zone = "us-east-1b"
  map_public_ip_on_launch = true

  tags = {
    Name = "public-subnet-2"
  }
}

# Create an Internet Gateway
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main_vpc.id

  tags = {
    Name = "main-igw"
  }
}

# Create a Route Table
resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.main_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }

  tags = {
    Name = "public-route-table"
  }
}

# Associate the Route Table with the Subnets
resource "aws_route_table_association" "public_subnet_1_association" {
  subnet_id      = aws_subnet.public_subnet_1.id
  route_table_id = aws_route_table.public_route_table.id
}

resource "aws_route_table_association" "public_subnet_2_association" {
  subnet_id      = aws_subnet.public_subnet_2.id
  route_table_id = aws_route_table.public_route_table.id
}

# Security Group for the Load Balancer
resource "aws_security_group" "alb_sg" {
  name        = "alb-sg"
  description = "Allow traffic to the Load Balancer"
  vpc_id      = aws_vpc.main_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
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
    Name = "ALB Security Group"
  }
}

# Security Group for WordPress instances
resource "aws_security_group" "wordpress_sg" {
  name        = "wordpress-sg"
  description = "Allow traffic to WordPress instances"
  vpc_id      = aws_vpc.main_vpc.id

  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Ideally, restrict to ALB's security group
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Restrict to your IP for SSH access
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "WordPress Security Group"
  }
}

# Security Group for MySQL instances
resource "aws_security_group" "mysql_sg" {
  name        = "mysql-sg"
  description = "Allow traffic to MySQL instances"
  vpc_id      = aws_vpc.main_vpc.id

  ingress {
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Ideally, restrict to ALB's security group
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Restrict to your IP for SSH access
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "MySQL Security Group"
  }
}

# Application Load Balancer
resource "aws_lb" "app_lb" {
  name               = "globaltrade-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.public_subnet_1.id, aws_subnet.public_subnet_2.id]

  enable_deletion_protection = false

  tags = {
    Name = "GlobalTrade ALB"
  }
}

# Target Group for WordPress
resource "aws_lb_target_group" "wordpress_tg" {
  name     = "wordpress-tg"
  port     = 8080
  protocol = "HTTP"
  vpc_id   = aws_vpc.main_vpc.id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200"
    port                = "traffic-port"
    protocol            = "HTTP"
  }

  tags = {
    Name = "WordPress Target Group"
  }
}

# Target Group for MySQL (API)
resource "aws_lb_target_group" "mysql_tg" {
  name     = "mysql-tg"
  port     = 3001
  protocol = "HTTP"
  vpc_id   = aws_vpc.main_vpc.id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200"
    port                = "traffic-port"
    protocol            = "HTTP"
  }

  tags = {
    Name = "MySQL Target Group"
  }
}

# Listener for HTTP traffic
resource "aws_lb_listener" "http_listener" {
  load_balancer_arn = aws_lb.app_lb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.wordpress_tg.arn
  }
}

# Listener for MySQL API traffic
resource "aws_lb_listener" "mysql_listener" {
  load_balancer_arn = aws_lb.app_lb.arn
  port              = "3001"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.mysql_tg.arn
  }
}

# Updated WordPress Launch Template
resource "aws_launch_template" "wordpress_template" {
  name_prefix   = "wordpress-template"
  image_id      = "ami-0c02fb55956c7d316"
  instance_type = "t3.micro"
  key_name      = aws_key_pair.deployer.key_name

  vpc_security_group_ids = [aws_security_group.wordpress_sg.id]

  user_data = base64encode(<<-EOF
    #!/bin/bash
    yum update -y
    yum install -y nodejs npm git

    # Clone repository
    cd /home/ec2-user
    git clone https://github.com/yourusername/globaltrade.git
    cd globaltrade

    # Install dependencies
    npm install

    # Build the application for production
    npm run build

    # Start the server
    node server.js

    # Keep the instance running
    while true; do sleep 30; done
  EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "WordPress Instance"
    }
  }
}

# Updated MySQL Launch Template  
resource "aws_launch_template" "mysql_template" {
  name_prefix   = "mysql-template"
  image_id      = "ami-0c02fb55956c7d316"
  instance_type = "t3.micro"
  key_name      = aws_key_pair.deployer.key_name

  vpc_security_group_ids = [aws_security_group.mysql_sg.id]

  user_data = base64encode(<<-EOF
    #!/bin/bash
    yum update -y
    yum install -y nodejs npm git

    # Clone repository
    cd /home/ec2-user
    git clone https://github.com/yourusername/globaltrade.git
    cd globaltrade

    # Install dependencies
    npm install

    # Build the application
    npm run build

    # Start the server
    node server.js

    # Keep the instance running
    while true; do sleep 30; done
  EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "MySQL Instance"
    }
  }
}

# Auto Scaling Group for WordPress
resource "aws_autoscaling_group" "wordpress_asg" {
  name                      = "wordpress-asg"
  desired_capacity          = 2
  max_size                  = 4
  min_size                  = 2
  health_check_type         = "ELB"
  health_check_grace_period = 300
  vpc_zone_identifier       = [aws_subnet.public_subnet_1.id, aws_subnet.public_subnet_2.id]

  launch_template {
    id      = aws_launch_template.wordpress_template.id
    version = "$Latest"
  }

  target_group_arns = [aws_lb_target_group.wordpress_tg.arn]

  tags = [
    {
      key                 = "Name"
      value               = "WordPress Instance"
      propagate_at_launch = true
    },
  ]
}

# Auto Scaling Group for MySQL
resource "aws_autoscaling_group" "mysql_asg" {
  name                      = "mysql-asg"
  desired_capacity          = 1
  max_size                  = 2
  min_size                  = 1
  health_check_type         = "ELB"
  health_check_grace_period = 300
  vpc_zone_identifier       = [aws_subnet.public_subnet_1.id, aws_subnet.public_subnet_2.id]

  launch_template {
    id      = aws_launch_template.mysql_template.id
    version = "$Latest"
  }

  target_group_arns = [aws_lb_target_group.mysql_tg.arn]

  tags = [
    {
      key                 = "Name"
      value               = "MySQL Instance"
      propagate_at_launch = true
    },
  ]
}

# Output the Load Balancer DNS
output "load_balancer_dns" {
  value = aws_lb.app_lb.dns_name
}
