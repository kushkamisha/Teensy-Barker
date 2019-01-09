const { nodeEnv, secretKey } = require('./config')
const debug = require('debug')('yey')
const db = require('./db')

db.query('select * from')

Console.log({ nodeEnv, secretKey })
debug('Message...')

// babel