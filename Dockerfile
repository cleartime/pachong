FROM node:12

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY . .
RUN npm config set registry http://registry.npm.taobao.org/ && \
    npm config set puppeteer_download_host=https://npm.taobao.org/mirrors && \
    npm install
# If you are building your code for production
# RUN npm ci --only=production
# Bundle app source
EXPOSE 9229
CMD [ "npm", "run", "start:dev" ]