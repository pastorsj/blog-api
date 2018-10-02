FROM node:10-alpine

LABEL Sam Pastoriza <samjpastoriza@gmail.com>

ARG WORKING_DIR

WORKDIR $WORKING_DIR
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh \
    graphicsmagick
RUN npm install --silent && mv node_modules ./
RUN mkdir -p ./uploads
COPY . .
EXPOSE 3000
