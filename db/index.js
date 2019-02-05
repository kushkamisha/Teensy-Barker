'use strict'

const { Client } = require('pg')
const config = require('../config')

const client = new Client(config.db)

module.exports = {
    open: () => client.connect(),
    close: () => client.end(),
    query: (text, params) => client.query(text, params),
}
