
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml* yarn.lock* package-lock.json* ./
RUN npm i -g pnpm && pnpm install --frozen-lockfile || pnpm install
COPY . .
RUN pnpm build

# Runtime stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
