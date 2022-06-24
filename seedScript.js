const {faker} = require("@faker-js/faker");
const MongoClient = require("mongodb").MongoClient;


async function addDummyData() {
    // Connection URL
    const uri = "mongodb://localhost:27017";

    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    try {
        await client.connect();
        console.log("Connected correctly to server");

        const collection = client.db("testDatabase").collection("users");

        // Initialize Dummy Users Data Array
        let usersData = [];

        for (let i = 0; i < 10000; i++) {
            let dummyUser = {
                name : faker.internet.userName(),
                email : faker.internet.email(),
                password : faker.internet.password(),
                phoneNo :  	faker.phone.number(),
                role : "ADMIN",
                address : faker.address.city()
            }
                usersData.push(dummyUser);
          
        }
        await collection.insertMany(usersData);

        client.close();
    } catch (err) {
        console.log(err);
        client.close();
    }
}

addDummyData();