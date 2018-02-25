# blog-api [![Build Status](https://travis-ci.org/pastorsj/blog-api.svg)](https://travis-ci.org/pastorsj/blog-api) [![Coverage Status](https://coveralls.io/repos/github/pastorsj/blog-api/badge.svg?branch=master)](https://coveralls.io/github/pastorsj/blog-api?branch=feature%2Fsystem-testing) [![Greenkeeper badge](https://badges.greenkeeper.io/pastorsj/blog-api.svg)](https://greenkeeper.io/)
A simple api for storing users and blogs. This is specifically used for my personal blog, which may or may not be up at this point. If it is, please feel free to read through it. Thanks!

#### Link to my [blog](http://blog.sampastoriza.com)

## API documentation
[Link to Documentation](http://docs.blog64.apiary.io/#)
### Setup
See [API_SETUP.md](./API_SETUP.md)

## Lets Encrypt with Docker
### Creating a certificate
```
docker run --rm -p 443:443 -p 80:80 --name letsencrypt -v "/etc/letsencrypt:/etc/letsencrypt" -v "/var/lib/letsencrypt:/var/lib/letsencrypt" certbot/certbot certonly -n -m "sampastoriza@yahoo.com" -d blog.sampastoriza.com --standalone --agree-tos
```

### Renewing the certificate
```
docker run --rm --name letsencrypt -v "/etc/letsencrypt:/etc/letsencrypt" -v "/var/lib/letsencrypt:/var/lib/letsencrypt" -v "/usr/share/nginx/html:/usr/share/nginx/html" certbot/certbot:latest renew --quiet
```

### Running the docker compose file
```
docker-compose -f docker-compose.yml up --build --force-recreate
```
Running in the background
```
docker-compose -f docker-compose.prod.yml up --build --force-recreate -d
```
Restarting all containers
```
docker restart $(docker ps -q)
```
Stopping all containers
```
docker stop $(docker ps -q)
```



