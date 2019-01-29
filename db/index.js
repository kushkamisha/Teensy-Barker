require('dotenv').config()
const { Client } = require('pg')

const client = new Client()
// client.connect()

module.exports = {
    open: () => client.connect(),
    close: () => client.end(),
    query: (text, params) => client.query(text, params),
}

