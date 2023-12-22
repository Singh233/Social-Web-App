FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm uninstall sharp

RUN npm install --platform=linux --arch=x64 sharp@0.32.4

COPY . .

ENV PORT=8000

EXPOSE 8000

CMD [ "npm", "start" ]