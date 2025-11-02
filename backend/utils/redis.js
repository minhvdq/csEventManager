const { createClient } = require('redis');
const config = require('./config');

const client = createClient({
    username: config.REDIS_USERNAME,
    password: config.REDIS_PASSWORD,
    socket: {
        host: config.REDIS_HOST,
        port: config.REDIS_PORT
    }
});

client.on('error', err => console.log('Redis Client Error', err));

client.connect().then(() => console.log('Redis client connected')).catch(err => console.log('Redis Client Error', err));

module.exports = client;
