/* mySeedScript.js */

// require the necessary libraries
const {faker} = require("faker");
const MongoClient = require("mongodb").MongoClient;

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

async function seedDB() {
    // Connection URL
    const uri = "mongodb://localhost:27017";

    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        // useUnifiedTopology: true,
    });

    try {
        await client.connect();
        console.log("Connected correctly to server");

        const collection = client.db("testDatabase").collection("users");

        // The drop() command destroys all data from a collection.
        // Make sure you run it against proper database and collection.
        collection.drop();

        // make a bunch of time series data
        let usersData = [];

        for (let i = 0; i < 10000; i++) {
            // userId: faker.datatype.uuid(),
            let dummyUser = {
                name : faker.internet.userName(),
                email : faker.internet.email(),
                password : faker.internet.password(),
                phoneNo :  	faker.phone.phoneNumber(),
                role : "ADMIN",
                address : faker.address.city()
            }
                usersData.push(dummyUser);
          
        }
        collection.insertMany(usersData);

        console.log("Database seeded! :)");
        client.close();
    } catch (err) {
        console.log(err.stack);
    }
}

seedDB();