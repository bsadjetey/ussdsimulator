# ----------------------
# Stage 1: Build Angular
# ----------------------
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the Angular app
RUN npm run build:docker

# ----------------------
# Stage 2: Serve with Nginx
# ----------------------
FROM nginx:alpine

# Copy built Angular files to Nginx html directory
COPY --from=build /app/dist/ngUssdSimulator /usr/share/nginx/html

# Copy optional Nginx config if needed
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Default command
CMD ["nginx", "-g", "daemon off;"]
