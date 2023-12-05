# 🌍 Social Media Web Application

Introducing Instagram-like web application, built using Node.js, MongoDB, EJS, Express JS, and Gulp with an advanced authentication system. My application offers an intuitive and scalable solution for creating a social media platform for sharing photos and videos with a focus on performance and user experience.

Here authentication system is built on top of Passport.js and allows for seamless user registration and login, with password encryption and session management for added security whereas backend architecture utilizes Node.js and MongoDB to ensure optimal data storage and retrieval, while EJS provides a flexible templating engine for efficient front-end development.

In addition, the build process is streamlined with Gulp for fast and automated deployment. Whether you're a beginner or an experienced developer, my web application is a great reference point for building a scalable and robust social media platform.

⛔️ Please note that this project is a work in progress, and some features may not be fully functional or available. See the listed features below.

## 👀 Demo

https://chillsanam.social 🚀

## 🧑🏻‍💻 Tech Stack

**Client:** EJS, SCSS

**Server:** Node-JS, Express, MongoDB Atlas, Redis

**Build-tool:** Sass Middleware (development), Gulp (Production)

## API Reference

https://github.com/Singh233/Social-Media-API

## Features

- Sign In/Up user ✋🏻
- Actions
  - Post image 🌆
  - Video uploads 🎥
  - Comment on Post 💬
  - Like Post ❤️
  - Like comment ♥️
  - Share Post ✉️
  - Follow/Unfollow Users 👀
  - Save Post 🔖
- User profile ⭐️
- Edit profile 🕺
- Search people 🔍
- Global Messaging ✅
- Direct Messaging ✅
  - Online/offline status 🌐
  - Typing Status 💬
  - Receive incoming message notification 🔔
- Video/Voice calling 📞
- Responsivity
  - 🖥️ Desktop
  - 📱 Mobile

### In progress 🚧

- Email of message request ✉️
- Share images in chat 🎆
- Tablet responsiveness 🟦

## Run Project Locally

### Without Docker

- Clone the project

```bash
  git clone https://github.com/Singh233/Social-Web-App.git
```

- Go to the project directory

```bash
  cd Social-Web-App
```

- Set up Environment variables (Mac/Ubuntu/Linux)

```bash
  sudo vi ~/.bash_profile
```

- Save profile (Mac/Ubuntu/Linux)

```bash
  source ~/.bash_profile
```

- Install Redis on system and run

```bash
  https://redis.io/docs/getting-started/installation/
```

- Install the packages

```bash
  npm install
```

- Start the server

```bash
  npm start
```

### Using Docker

- Clone the project

```bash
  git clone https://github.com/Singh233/Social-Web-App.git
```

- Pull the docker-setup branch

```bash
  git pull docker-setup
```

- Go to the project directory

```bash
  cd Social-Web-App
```

- (NOTE) Add .env and SSL (certificate and key) files to project
- Run command

```bash
  docker compose up
```

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`MONGODB_CLUSTER_PASSWORD`
`CODEIAL_ENVIRONMENT`
`CODEIAL_ASSET_PATH`
`CODEIAL_JWT_SECRET`
`CODEIAL_SESSION_KEY`

`CODEIAL_GOOGLE_CLIENT_ID`
`CODEIAL_GOOGLE_CLIENT_SECRET`
`CODEIAL_GOOGLE_CALLBACK_URL`

`CODEIAL_FACEBOOK_CLIENT_ID`
`CODEIAL_FACEBOOK_CLIENT_ID`

`CODEIAL_GITHUB_CLIENT_ID`
`CODEIAL_GITHUB_CLIENT_ID`

`CODEIAL_GMAIL_USERNAME`
`CODEIAL_GMAIL_PASSWORD`

`CODEIAL_DB`
`CODIEAL_DEVELOPMENT_DB`
`CODIEAL_PRODUCTION_DB`
`CODEIAL_CERTIFICATE`
`CODEIAL_CERTIFICATE_KEY`
`SANAM_SOCIAL_AWS_MACHINE_IP`

## Screenshots

![912shots_so](https://github.com/Singh233/Social-Web-App/assets/37498067/fd1fed85-c7e8-4eae-9346-107597031e3d)
![160shots_so](https://github.com/Singh233/Social-Web-App/assets/37498067/76ba6efa-78b2-4e6e-9b73-1cf420542ec4)
![444shots_so](https://github.com/Singh233/Social-Web-App/assets/37498067/3a94d9da-dcb5-4226-854a-ea8dbfda478d)
![81shots_so](https://github.com/Singh233/Social-Web-App/assets/37498067/51b0a6c3-3b82-4c2b-a813-3e64d7fcda4c)
![593shots_so](https://github.com/Singh233/Social-Web-App/assets/37498067/dd57a60f-3403-4865-a250-4ce7c97065c1)
![982shots_so](https://github.com/Singh233/Social-Web-App/assets/37498067/4c2ebda9-fbf2-4ba2-8feb-5004d7c68238)

## Related

Here are some more Cool Projects

- [Issue-Tracker-App](https://github.com/Singh233/Issue-Tracker-App) 🚀
- [Social-React-App](https://github.com/Singh233/Social-React-App) 🎯

## 🚀 About Me

I'm an Aspiring full stack developer...
Love to create, design and build cool projects 😎 and have passion for creating innovative solutions to complex problems using cutting-edge technologies. I have a strong understanding of both front-end and back-end development, and constantly seeking to improve my skills in these areas.

## 🔗 Links

[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/sanambir-singh-2b4b3a133/)
[![instagram](https://img.shields.io/badge/instagram-1DA1F2?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/awesanam/)

## Author

- [@SanambirSingh](https://github.com/Singh233) 🤗

## Feedback

If you have any feedback, please reach out to me at sanambir123@gmail.com
