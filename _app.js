const { nodeEnv, secretKey } = require('./config')
const debug = require('debug')('yey')

Console.log({ nodeEnv, secretKey })
debug('Message...')

// babel