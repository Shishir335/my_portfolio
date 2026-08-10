const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message, err.stack);
    process.exit(1);
});

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE ? process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD) : "mongodb+srv://mahbubshishir973:mahbubullah@cluster0.3k09t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const { ensureDefaultAdmin } = require('./controllers/adminController');

mongoose.connect(DB)
    .then(async () => {
        console.log('DB connection successful!');
        await ensureDefaultAdmin();
    })
    .catch(err => {
        console.error('DB Connection Warning:', err.message);
    });

const app = require('./app');

const port = process.env.PORT || 3000;

const server = app.listen(port, '0.0.0.0', () => {
    console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Logged error:');
    console.log(err ? (err.stack || err.message || err) : 'Unknown rejection');
});
