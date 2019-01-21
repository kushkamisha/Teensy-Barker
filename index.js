/* eslint-disable no-console */
'use strict'

const logger = require('./logger')
const { processWebpage } = require('./lib/urls')
const { createWebpage, getUrl } = require('./lib/utils')

console.time('program time')
const url = getUrl()
const homeUrl = url

const processed = new Set()
const webpage = createWebpage(url, homeUrl, processed)

processWebpage(webpage)
    .then(() => {
        logger.info('Done!')
        console.timeEnd('program time')
        process.exit(0)
    }, err => {
        throw err
    })
