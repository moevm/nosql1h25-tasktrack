FROM node:18
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN npm install -g http-server

RUN echo '#!/bin/sh\nset -e\ncp -r /app/build/. /static/\nexec http-server -p 8000 /static' > /start.sh && \
    chmod +x /start.sh

CMD ["/start.sh"]