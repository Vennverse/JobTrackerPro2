# AutoJobr Deployment Guide

## VM/Cloud Deployment Instructions

### Prerequisites
- Node.js 20+ and npm
- PostgreSQL 16+ database
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)

### 1. Server Setup

#### Ubuntu/Debian VPS Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE autojobr;
CREATE USER autojobr_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE autojobr TO autojobr_user;
\q
```

### 3. Application Deployment

```bash
# Create application directory
sudo mkdir -p /var/www/autojobr
sudo chown $USER:$USER /var/www/autojobr

# Clone repository
cd /var/www/autojobr
git clone https://github.com/yourusername/autojobr.git .

# Install dependencies
npm install

# Copy environment file
cp .env.production .env

# Edit environment variables
nano .env
```

### 4. Environment Configuration

Edit the `.env` file with your production values:

```env
# Database
DATABASE_URL=postgresql://autojobr_user:your_secure_password@localhost:5432/autojobr

# Server
NODE_ENV=production
PORT=5000

# Session Secret (generate with: openssl rand -base64 32)
SESSION_SECRET=your-super-secure-session-secret

# Required API Keys
GROQ_API_KEY=your-groq-api-key
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com

# OAuth (at least one required)
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# Payment (optional)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Domain
DOMAIN=yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com
```

### 5. Build and Database Setup

```bash
# Run database migrations
npm run db:push

# Build the application
npm run build

# Test the application
npm start
```

### 6. PM2 Process Management

Create PM2 ecosystem file:

```bash
# Create ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'autojobr',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/autojobr',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: '/var/log/autojobr/err.log',
      out_file: '/var/log/autojobr/out.log',
      log_file: '/var/log/autojobr/combined.log',
      time: true
    }
  ]
};
EOF

# Create log directory
sudo mkdir -p /var/log/autojobr
sudo chown $USER:$USER /var/log/autojobr

# Start application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 7. Nginx Configuration

```bash
# Create Nginx site configuration
sudo tee /etc/nginx/sites-available/autojobr << EOF
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # File upload support
        client_max_body_size 10M;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://localhost:5000;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/autojobr /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. SSL Certificate Setup

```bash
# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

### 9. Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

### 10. Monitoring and Maintenance

```bash
# Monitor application
pm2 monit

# View logs
pm2 logs autojobr

# Restart application
pm2 restart autojobr

# Update application
cd /var/www/autojobr
git pull origin main
npm install
npm run build
pm2 restart autojobr
```

## AWS EC2 Deployment

### Launch EC2 Instance
1. Choose Ubuntu 22.04 LTS AMI
2. Instance type: t3.medium or larger
3. Configure security group:
   - SSH (22) from your IP
   - HTTP (80) from anywhere
   - HTTPS (443) from anywhere
4. Add storage: 20GB+ SSD

### RDS Database Setup
1. Create PostgreSQL RDS instance
2. Note the endpoint URL
3. Update DATABASE_URL in .env file

### S3 for File Storage (Optional)
```bash
# Install AWS CLI
sudo apt install awscli -y

# Configure AWS credentials
aws configure
```

Update .env for S3:
```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=autojobr-resumes
```

## Docker Deployment (Alternative)

### Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/autojobr
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:16
    environment:
      POSTGRES_DB: autojobr
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   
   # Test database connection
   psql $DATABASE_URL
   ```

2. **Application Won't Start**
   ```bash
   # Check logs
   pm2 logs autojobr
   
   # Check environment variables
   pm2 env autojobr
   ```

3. **File Upload Issues**
   ```bash
   # Check disk space
   df -h
   
   # Check permissions
   ls -la /var/www/autojobr
   ```

4. **SSL Certificate Issues**
   ```bash
   # Check certificate status
   sudo certbot certificates
   
   # Renew certificates
   sudo certbot renew
   ```

### Performance Optimization

1. **Enable Gzip Compression** (Nginx)
2. **Database Connection Pooling** (Already configured)
3. **Redis for Session Storage** (Optional)
4. **CDN for Static Assets** (CloudFlare recommended)

### Security Checklist

- [ ] Strong database passwords
- [ ] Firewall configured
- [ ] SSL certificate installed
- [ ] Environment variables secured
- [ ] Regular security updates
- [ ] Database backups configured
- [ ] Log monitoring setup

### Backup Strategy

```bash
# Database backup script
#!/bin/bash
BACKUP_DIR="/var/backups/autojobr"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
pg_dump $DATABASE_URL > $BACKUP_DIR/autojobr_$DATE.sql
gzip $BACKUP_DIR/autojobr_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

Add to crontab for daily backups:
```bash
0 2 * * * /path/to/backup-script.sh
```