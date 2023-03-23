cd /var/www/production/api
git checkout master
git pull
pm2 reload ecosystem.config.js AllianceApiProduction --env production --update-env --max-memory-restart 8192M
#pm2 reload ecosystem.config.js AllianceApiProduction --env production --update-env --no-autorestart --max-memory-restart 8192M
