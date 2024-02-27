
const dotenv = require('dotenv');
// const app = require('./app');
const mongoose = require('mongoose');

const fs = require('fs');

const Tour = require('./../../models/tour_model');
const { error } = require('console');

dotenv.config({ path: './config.env' });

const DB = process.env.DATA_BASE.replace('<PASSWORD>', process.env.MONGO_PASSWORD);
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(con => {
    // console.log(con.connections);
    console.log('DB Connection Successful.');
});


const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));


const importData = async () => {
    try {
        await Tour.create(tours);
        console.log("data successfully loaded")
    } catch (error) {
        console.log(error)
    }
}


const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log("data successfully deleted")
    } catch (error) {
        console.log(error)
    }
}

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}

// console.log(process.argv)