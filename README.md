# science
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

node -v
npm -v

git clone https://github.com/username/proyek-kamu.git
cd proyek-kamu

npm install

sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000   # port Node.js kalau masih direct
sudo ufw enable

sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/science

server {
    listen 80;
    server_name example.com www.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}


sudo ln -s /etc/nginx/sites-available/science /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

sudo npm install -g pm2

pm2 start server.js




