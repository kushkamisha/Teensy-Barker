const { Pool } = require('pg')

const pool = new Pool()

/**
 * Usage
 * 
 * const db = require('./db')
 *
 * db.query('select * from')
 */

module.exports = {
    query: (text, params, callback) => {
        return pool.query(text, params, callback)
    }
}
