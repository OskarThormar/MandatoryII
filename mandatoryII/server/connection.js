import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt'; 
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb'; 
const client = new MongoClient(url);

let databaseInstance; 

async function connectToDatabase() {
    if (databaseInstance) {
        return databaseInstance; 
    }
    try {
        await client.connect();
        databaseInstance = client.db();
        console.log("Forbundet til MongoDB!");

        const collections = await databaseInstance.listCollections({ name: 'users' }).toArray();
        const usersCollectionExists = collections.length > 0;

        if (!usersCollectionExists) {
            await databaseInstance.createCollection('users');
            console.log("Kollektionen 'users' er oprettet.");
        }

        const userCount = await databaseInstance.collection('users').countDocuments();
        if (userCount === 0) {
            const defaultUsername = "oskar";
            const defaultPassword = "thormar"; 
            const hashedPassword = await bcrypt.hash(defaultPassword, 12);

            await databaseInstance.collection('users').insertOne({
                username: defaultUsername,
                password: hashedPassword
            });
            console.log(`Standardbruger '${defaultUsername}' oprettet med hashet password.`);
        }

        return databaseInstance;
    } catch (error) {
        console.error("Fejl ved forbindelse til MongoDB:", error);
        process.exit(1);
    }
}

const db = await connectToDatabase();

export default db;