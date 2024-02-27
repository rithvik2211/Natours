
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATA_BASE.replace('<PASSWORD>', process.env.MONGO_PASSWORD);
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(con => {
    // console.log(con.connections);
    console.log('DB Connection Successful.');
});

// testTour.save().then(doc => {
//     console.log(doc);
// }).catch(err => {
//     console.log('ERROR : ', err);
// });

const port = 5000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});



process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log('UNHANDLED REJECTION! Shutting Down.....');
    server.close(() => {
        process.exit(1);
    });
});


process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! Shutting Down.....');
    console.log(err.name, err.message);

    server.close(() => {
        process.exit(1);
    });
})