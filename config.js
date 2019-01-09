require('dotenv').config() // load environment variables

module.exports = {
    nodeEnv: process.env.NODE_ENV,
    secretKey: process.env.SECRET_KEY
}