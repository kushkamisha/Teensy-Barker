'use strict'

const logger = require('./logger')
const { processWebpage } = require('./lib/urls')
const { createWebpage, getUrl } = require('./lib/utils')

const url = getUrl()
const homeUrl = url

const processed = new Set()
const webpage = createWebpage(url, homeUrl, processed)

processWebpage(webpage)
    .then(() => {
        logger.info('Done!')
    }, err => {
        throw err
    })
