const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const url = 'db://root:example@db:27017/';
const dbName = 'test'; 
const collectionName = 'Pettan';

MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
    if (err) throw err;

    const db = client.db(dbName);
    const pettans = JSON.parse(fs.readFileSync('./pettans.json', 'utf8'));

    db.collection(collectionName).insertMany(pettans, (err, res) => {
        if (err) throw err;
        console.log(`${res.insertedCount} Carta Pettan insertada!`);
        client.close();
    });
});



