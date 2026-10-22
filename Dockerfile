# PondiFarm Desk: compila a versão web do Expo e serve-a com nginx.
# Usado pelo Coolify na VPS (porta do container 80, mapeada para 8093 no host).

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# A URL da API fica embutida no bundle no momento da compilação.
ARG EXPO_PUBLIC_API_URL=https://pondifarm-api-euc.azurewebsites.net
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL
RUN npx expo export --platform web --output-dir dist --clear \
 && ! grep -rq "localhost:8000" dist/_expo

FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/security-headers.inc /etc/nginx/conf.d/security-headers.inc
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
