import { MongoClient } from 'mongodb'

// Connection URL
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'Danske Heste';

await client.connect();

const db = await client.db(dbName);


export default {
    danskeheste: db.collection("danskeheste")
};
