import { Router } from 'express';
import bcrypt from 'bcrypt';
import db from '../connection.js';

const router = Router();

router.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Brugernavn og adgangskode er påkrævet.' });
    }

    try {
        const usersCollection = db.collection('users');
        const existingUser = await usersCollection.findOne({ username });

        if (existingUser) {
            return res.status(409).json({ error: 'Brugernavn er allerede taget.' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        await usersCollection.insertOne({ username, password: hashedPassword });

        res.status(201).json({ message: 'Bruger oprettet!' });
    } catch (error) {
        console.error("Fejl ved brugeroprettelse:", error);
        res.status(500).json({ error: 'Fejl ved oprettelse af bruger.' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Brugernavn og adgangskode er påkrævet.' });
    }

    try {
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ username });

        if (!user) {
            return res.status(401).json({ error: 'Ugyldigt brugernavn eller adgangskode.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Ugyldigt brugernavn eller adgangskode.' });
        }

        req.session.userId = user._id;
        req.session.username = user.username;

        res.status(200).json({ message: 'Login succesfuld!', username: user.username });
    } catch (error) {
        console.error("Fejl ved login:", error);
        res.status(500).json({ error: 'Serverfejl ved login.' });
    }
});

router.get('/check-auth', (req, res) => {
    if (req.session && req.session.userId) {
        res.status(200).json({ isAuthenticated: true, username: req.session.username });
    } else {
        res.status(401).json({ isAuthenticated: false, message: 'Ikke autentificeret.' });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Fejl ved logout:", err);
            return res.status(500).json({ error: 'Fejl ved logud.' });
        }
        res.clearCookie('connect.sid'); 
        res.status(200).json({ message: 'Logud succesfuld.' });
    });
});

export default router;