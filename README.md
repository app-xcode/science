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

sudo npm install -g pm2

pm2 start server.js


