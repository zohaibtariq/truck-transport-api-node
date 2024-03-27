#chmod +x script.sh

# means it will execute every hour (https://crontab.guru/#0_*_*_*_*) https://www.warp.dev/terminus/how-to-run-cron-every-hour
#0 * * * *

#0 * * * * /path/to/script.sh
#chmod +x script.sh

# https://stackoverflow.com/questions/45138944/where-is-node-while-using-nvm
# nvm which default
## /home/nstadmin/.nvm/versions/node/v16.19.1/bin/node
# nvm which node
## /home/nstadmin/.nvm/versions/node/v18.15.0/bin/node

# path/to/node/ /path/to/cron/jobs/test.js
# node /path/to/cron/jobs/test.js
# /home/nstadmin/.nvm/versions/node/v16.19.1/bin/node
# /home/nstadmin/.nvm/versions/node/v18.15.0/bin/node
# /var/www/production/api/src/cron/jobs/test.js

/home/nstadmin/.nvm/versions/node/v16.19.1/bin/node /var/www/production/api/src/cron/jobs/test.js