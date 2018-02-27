FROM node:8.9-alpine

LABEL Sam Pastoriza <samjpastoriza@gmail.com>

ARG WORKING_DIR

WORKDIR $WORKING_DIR
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh
RUN npm install --silent && mv node_modules ./
RUN mkdir -p ./uploads
COPY . .
EXPOSE 3000