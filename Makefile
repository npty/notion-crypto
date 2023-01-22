start:
	pm2 start dist/index.js --name "notion-crypto" --node-args="-r dotenv/config"

stop:
	pm2 stop notion-crypto

restart:
	yarn build && pm2 restart notion-crypto

log:
	pm2 logs notion-crypto
