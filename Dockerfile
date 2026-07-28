FROM node:20-alpine
WORKDIR /app

COPY package*.json .
RUN npm install --production

COPY . .
EXPOSE 3000

CMD ["node", "app.js"]

# Build: docker build -t task-tracker .
# Run: docker run -p 3000:3000 --name task-tracker task-tracker