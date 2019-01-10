require('dotenv').config() // load environment variables

module.exports = {
    nodeEnv: process.env.NODE_ENV,
    defaultUrl: process.env.DEFAULT_URL
}