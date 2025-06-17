import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { rateLimit } from 'express-rate-limit';
import cors from 'cors';

import db from './connection.js';

const app = express();

app.use(helmet());
app.use(express.json()); 


app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true 
}));

app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false, 
    saveUninitialized: false, 
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI, 
        ttl: 14 * 24 * 60 * 60, 
        autoRemove: 'interval',
        autoRemoveInterval: 10
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'lax' 
    }
}));


const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300, 
    standardHeaders: 'draft-8',
    legacyHeaders: false,
});
app.use(generalLimiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false
});

app.use("/api/auth", authLimiter);

import authRouter from './routers/authRouter.js';
app.use('/api/auth', authRouter);

import emailRouter from './routers/emailRouter.js';
app.use('/api/email', emailRouter);


app.get("/*", (req, res) => { 
    res.status(404).send("<h1>Not Found</h1>");
});

app.all("/*", (req, res) => { 
    res.status(404).send({ message: `${req.path} for ${req.method} not found` });
});

const PORT = Number(process.env.PORT) || 8080;
app.listen(PORT, () => console.log("Server is running on port", PORT));
