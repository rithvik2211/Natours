
const dotenv = require('dotenv');
// const app = require('./app');
const mongoose = require('mongoose');

const fs = require('fs');

const Tour = require('./../../models/tour_model');
const Review = require('./../../models/review_model');
const User = require('./../../models/user_model');


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


const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const user = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));


const importData = async () => {
    try {
        await Tour.create(tours);
        await User.create(user, { validateBeforeSave: false });
        await Review.create(reviews);
        console.log("data successfully loaded")
        process.exit();

    } catch (error) {
        console.log(error);
        process.exit();

    }
}


const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log("data successfully deleted")
        process.exit();
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