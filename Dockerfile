#FROM node:alpine
FROM node:20.5.1

RUN mkdir -p /usr/src/node-app && chown -R node:node /usr/src/node-app

WORKDIR /usr/src/node-app

COPY package.json yarn.lock ./

#USER node

# Install necessary system dependencies (such as Python)
RUN apt-get update && \
    apt-get install -y python3 && \
    apt-get clean

# Install PM2 globally using npm
RUN npm install -g pm2

RUN ls -l /usr/local/bin

ENV PATH="/usr/local/bin:${PATH}"

# Install Yarn globally
#RUN npm install -g yarn

# Install dependencies using Yarn
RUN yarn install
#RUN npm install --legacy-peer-deps

#RUN yarn install --pure-lockfile

# Copy the rest of the application files to the working directory
COPY . .

# Replace the following with your actual app start command
CMD ["npm", "run", "startw"]

COPY --chown=node:node . .

EXPOSE 3000
