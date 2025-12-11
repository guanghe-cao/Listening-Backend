# DigitalOcean Droplet Deployment Guide

This guide walks you through deploying the Listen Backend to a fresh Ubuntu Droplet on DigitalOcean.

## Prerequisites

- A DigitalOcean account
- A Droplet with Ubuntu 22.04 LTS (or newer)
- SSH access to your Droplet (`ssh root@YOUR_DROPLET_IP`)
- Your DashScope API Key (for TTS service)

## Step-by-Step Deployment

### Step 1: Update System Packages

Connect to your Droplet via SSH and update the system:

```bash
ssh root@YOUR_DROPLET_IP
apt update && apt upgrade -y
```

### Step 2: Install Node.js

We'll use NodeSource to install Node.js 20 LTS:

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

**Alternative: Using NVM (Node Version Manager)**

If you prefer NVM:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

### Step 3: Install Git

```bash
apt install -y git
```

### Step 4: Clone the Repository

```bash
# Navigate to a suitable directory (e.g., /var/www or /opt)
cd /opt

# Clone your repository (replace with your actual repo URL)
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git listen-backend

# Navigate into the project directory
cd listen-backend
```

**Note:** If your repository is private, you may need to:
- Set up SSH keys on the server
- Or use a personal access token for HTTPS

### Step 5: Install Dependencies

```bash
npm install
```

This will install all production and development dependencies, including Prisma.

### Step 6: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your preferred editor
nano .env
```

Fill in the required values:

```env
PORT=3000
DATABASE_URL="file:./prisma/prod.db"
DASHSCOPE_API_KEY=your_actual_dashscope_api_key_here
```

**Important Notes:**
- For SQLite: Use `file:./prisma/prod.db` (or any path you prefer)
- For PostgreSQL: Use `postgresql://user:password@host:5432/dbname`
- Make sure the database directory is writable: `chmod 755 prisma`

### Step 7: Initialize the Database

#### For SQLite (Default):

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate:deploy

# (Optional) Seed initial data
npm run prisma:seed
```

#### For PostgreSQL (Optional):

If you're using PostgreSQL:

```bash
# Install PostgreSQL client (if needed)
apt install -y postgresql-client

# Create database (if not exists)
# Connect to your PostgreSQL server and create the database

# Update DATABASE_URL in .env to point to PostgreSQL
# Then run:
npm run prisma:generate
npm run prisma:migrate:deploy
```

### Step 8: Build the Project

Since this is a TypeScript project, we need to compile it:

```bash
npm run build
```

This will compile TypeScript files to JavaScript in the `dist/` directory.

### Step 9: Import Initial Articles (Optional)

If you have a script to import articles:

```bash
npm run import:articles
```

### Step 10: Install PM2 (Process Manager)

PM2 keeps your Node.js application running and automatically restarts it if it crashes:

```bash
npm install -g pm2
```

### Step 11: Start the Server with PM2

#### Option A: Using the Ecosystem File (Recommended)

```bash
# Create logs directory
mkdir -p logs

# Start with PM2 using the ecosystem config
pm2 start ecosystem.config.js

# Save PM2 configuration to start on system reboot
pm2 save
pm2 startup
```

The `pm2 startup` command will output a command to run as root. Copy and run that command.

#### Option B: Direct PM2 Start

```bash
# Start the server
NODE_ENV=production pm2 start dist/server.js --name listen-backend

# Save PM2 configuration
pm2 save
pm2 startup
```

### Step 12: Verify the Deployment

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs listen-backend

# Test the health endpoint
curl http://localhost:3000/health
```

You should see `{"status":"ok"}`.

### Step 13: Configure Firewall (Optional but Recommended)

Allow HTTP/HTTPS traffic:

```bash
# Allow SSH (already enabled)
ufw allow 22/tcp

# Allow your application port
ufw allow 3000/tcp

# Or if using a reverse proxy (Nginx), allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable
```

### Step 14: Set Up Nginx Reverse Proxy (Optional but Recommended)

If you want to use a domain name and HTTPS:

```bash
# Install Nginx
apt install -y nginx

# Create Nginx configuration
nano /etc/nginx/sites-available/listen-backend
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
ln -s /etc/nginx/sites-available/listen-backend /etc/nginx/sites-enabled/
nginx -t  # Test configuration
systemctl restart nginx
```

## Managing the Server

### Viewing Logs

```bash
# View all logs
pm2 logs listen-backend

# View only error logs
pm2 logs listen-backend --err

# View only output logs
pm2 logs listen-backend --out

# View last 100 lines
pm2 logs listen-backend --lines 100
```

### Restarting the Server

```bash
# Restart the application
pm2 restart listen-backend

# Stop the application
pm2 stop listen-backend

# Start the application
pm2 start listen-backend
```

### Updating the Application

When you need to update the code:

```bash
# Navigate to project directory
cd /opt/listen-backend

# Pull latest changes
git pull

# Install any new dependencies
npm install

# Rebuild the project
npm run build

# Run database migrations (if schema changed)
npm run prisma:generate
npm run prisma:migrate:deploy

# Restart PM2
pm2 restart listen-backend

# Check status
pm2 status
pm2 logs listen-backend --lines 50
```

### Monitoring

```bash
# Monitor PM2 processes
pm2 monit

# View detailed process information
pm2 show listen-backend

# View PM2 process list
pm2 list
```

## Troubleshooting

### Server Not Starting

1. Check PM2 logs: `pm2 logs listen-backend`
2. Check if port 3000 is in use: `lsof -i :3000`
3. Verify environment variables: `cat .env`
4. Check database connection: Ensure `DATABASE_URL` is correct

### Database Issues

1. For SQLite: Ensure the `prisma` directory is writable:
   ```bash
   chmod 755 prisma
   chmod 644 prisma/*.db
   ```

2. For PostgreSQL: Verify connection string and database exists

### TTS Not Working

1. Verify `DASHSCOPE_API_KEY` is set correctly in `.env`
2. Check PM2 logs for TTS-related errors
3. Test the TTS endpoint: `curl -X POST http://localhost:3000/tts/segments -H "Content-Type: application/json" -d '{"text":"test"}'`

### Port Already in Use

If port 3000 is already in use:

1. Find the process: `lsof -i :3000`
2. Kill it: `kill -9 <PID>`
3. Or change the port in `.env` and restart PM2

## Security Considerations

1. **Never commit `.env` file** - It contains sensitive API keys
2. **Use strong passwords** for database (if using PostgreSQL)
3. **Keep system updated**: `apt update && apt upgrade -y`
4. **Use HTTPS** with Let's Encrypt (recommended for production)
5. **Restrict SSH access** to specific IPs if possible
6. **Use a non-root user** for running the application (create a dedicated user)

## Next Steps

- Set up SSL/TLS with Let's Encrypt
- Configure automated backups for the database
- Set up monitoring (e.g., PM2 Plus, or external monitoring service)
- Configure log rotation
- Set up CI/CD pipeline for automated deployments

## Quick Reference

```bash
# Start server
pm2 start ecosystem.config.js

# Stop server
pm2 stop listen-backend

# Restart server
pm2 restart listen-backend

# View logs
pm2 logs listen-backend

# Update application
git pull && npm install && npm run build && pm2 restart listen-backend

# Check status
pm2 status
```

## Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs listen-backend`
2. Check system logs: `journalctl -u nginx` (if using Nginx)
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed: `npm install`

