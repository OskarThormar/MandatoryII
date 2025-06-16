import db from './connection.js';

const newHorse = await db.danskeheste.insertOne({ name: "Islandsk hest" });

console.log(newHorse);