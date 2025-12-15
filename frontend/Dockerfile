FROM node:20-alpine

WORKDIR /app

# Instala deps primero (mejor cache)
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Copia el resto
COPY . .

EXPOSE 5173

# Hot reload: host 0.0.0.0 dentro del container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173", "--strictPort"]
