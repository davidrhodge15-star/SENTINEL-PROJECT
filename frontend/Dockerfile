# 1. Use Node.js to build the app
FROM node:20-slim

# 2. Set working directory
WORKDIR /app

# 3. Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# 4. Copy the rest of the frontend code
COPY . .

# 5. Expose the Vite port
EXPOSE 5173

# 6. Run the dev server (calling all interfaces with --host)
CMD ["npm", "run", "dev", "--", "--host"]