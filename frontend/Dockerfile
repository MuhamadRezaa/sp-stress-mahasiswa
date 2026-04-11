FROM node:22-alpine

WORKDIR /app

# Add build-time arguments (optional for dev, but good for consistency)
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy application source
COPY . .

# Expose Vite default port
EXPOSE 5173

# Run Vite in development mode with host access
CMD ["npm", "run", "dev", "--", "--host"]
