// mongoose.connect similar to MongoClient.connect(npm mongodb)
const mongoose = require("mongoose");


const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`db connection established ☑️: ${conn.connection.host}`);
    } catch (err) {
        console.log(`${err.message}`);
    }
};

module.exports = connectDB;


// const mongoose = require("mongoose");

// const connectDB = async () => {
//     try {
//         const conn = await mongoose.connect(process.env.MONGO_URI);
//         console.log(`db connection established ☑️: ${conn.connection.host}`);
//     } catch (err) {
//         console.log(`${err.message}`);
//     }
// };

// module.exports = connectDB;

