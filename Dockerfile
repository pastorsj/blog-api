FROM node:8.9-alpine
LABEL Sam Pastoriza <samjpastoriza@gmail.com>
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh
RUN npm install --silent && mv node_modules ./
COPY . .
EXPOSE 3000
CMD npm run http