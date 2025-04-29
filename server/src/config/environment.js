import dotenv from "dotenv";

dotenv.config();

const config = {
    host: process.env.HOST,
    connStr: process.env.ATLAS_URI,
    feUrl: process.env.FE_URL,
    beURL: process.env.BE_URL,
    port: process.env.PORT,
    feRedirectUri: process.env.FE_REDIRECT_URI,
    buildMode: process.env.BUILD_MODE,
    salt: process.env.SALT,
    accessTokenPrivateKey: process.env.ACCESS_TOKEN_PRIVATE_KEY,
    refreshTokenPrivateKey: process.env.REFRESH_TOKEN_PRIVATE_KEY,
    accessTokenExp: process.env.ACCESS_TOKEN_EXP,
    refreshTokenExp: process.env.REFRESH_TOKEN_EXP,
    mailer: {
        host: process.env.MAIL_HOST,
        mail: process.env.MAIL_MAILER,
        port: process.env.MAIL_PORT,
        username: process.env.MAIL_USERNAME,
        password: process.env.MAIL_PASSWORD,
        encryption: process.env.MAIL_ENCRYPTION,
        from: process.env.MAIL_FROM_ADDRESS,
        from_name: process.env.MAIL_FROM_NAME,
    },
    firebaseConfig: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    },
    googleAuthConfig: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        googleRedirectUri: `${process.env.GOOGLE_REDIRECT_URI}`,
        calendarRedirectUri: `${process.env.GOOGLE_CALENDAR_REDIRECT_URI}`,
    },
    facebookAuthConfig: {
        appId: process.env.FACEBOOK_APP_ID,
        appSecret: process.env.FACEBOOK_APP_SECRET,
        callBackUrl: process.env.FACEBOOK_CALLBACK_URL,
    },
    env: process.env.ENV,
    rabbitMQConfig: {
        protocol: "amqp",
        hostname: "localhost",
        port: "5672",
        username: "cazoi",
        password: "secret",
        vhost: "customers",
    },
    rabbitMQURL: process.env.RABBITMQ_URL,
};

export default config;
