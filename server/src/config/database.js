const {connect, connection} = require('mongoose');
const ENV = require('./env');

const connectDB = async () => {
    if (!ENV.MONGO_URI) {
        throw new Error('MONGO_URI is missing from .env');
    }

    try{
        await connect(ENV.MONGO_URI, { family: 4, serverSelectionTimeoutMS: 10000 });
        console.log('MongoDB connected');
        return connection;
    }catch(error){
        console.error('MongoDB connection error:', error.message);
        throw error;
    }

}

module.exports = connectDB;
