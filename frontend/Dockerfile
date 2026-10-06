FROM node:20-alpine

WORKDIR /app

# Salin package.json dan package-lock.json
COPY package*.json ./

# Install dependensi frontend
RUN npm install

# Salin seluruh kode frontend
COPY . .

EXPOSE 5173

# Jalankan Vite server dengan binding 0.0.0.0
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
