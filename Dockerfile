# 1. Use nodejs image as base
FROM node:24

# 2. Set working dir on container
WORKDIR /app

# 3. Copy package.json and package-lock.json to working dir
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy all files to working dir (except those in .dockerignore)
COPY . .

# 6. Expose port 3030
EXPOSE 3030

# 7. Define start command (npm start or node server.js)
CMD ["npm", "start"]

# Pass the env-file to docker run command using --env-file option
# Run the docker container using command:
# docker run --env-file .env -p 3030:3030 <image_name>
