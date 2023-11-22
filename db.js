require('dotenv').config()
const mongoose = require('mongoose');
// const mongoURI = 'mongodb://127.0.0.1:27017/inotebook';

const mongoURI = process.env.DATABASE_URI;

const connectToMongo = () => {
    main().catch(err => console.log(err));
    async function main() {
        await mongoose.connect(mongoURI);
        console.log("We are connected!");
    }

}

module.exports = connectToMongo;
