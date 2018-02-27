docker run --rm --name letsencrypt -v "/etc/letsencrypt:/etc/letsencrypt" -v "/var/lib/letsencrypt:/var/lib/letsencrypt" -v "/usr/share/nginx/html:/usr/share/nginx/html" certbot/certbot:latest renew --quiet
docker stop "$(docker ps -q)"
docker-compose -f docker-compose.prod.yml rm blog-api -f
docker-compose -f docker-compose.prod.yml build blog-api --no-cache
docker-compose -f docker-compose.prod.yml up --force-recreate -d