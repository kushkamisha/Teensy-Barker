'use strict'

module.exports = {
    env: 'production',
    db: {
        user: process.env.PGUSER,
        host: process.env.PGHOST,
        database: process.env.PGDATABASE,
        password: process.env.PGPASSWORD,
        port: process.env.PGPORT,
    },
    defaultUrl: process.env.DEFAULT_URL,
}
