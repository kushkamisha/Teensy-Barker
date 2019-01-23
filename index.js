/* eslint-disable no-console */
'use strict'

const logger = require('./logger')
const { createWebpage, processWebpage } = require('./lib/webpage')
const urls = require('./lib/urls')

console.time('program exec time')
const url = urls.getUrlFromCLI()
const homeUrl = url

const processed = new Set()
const webpage = createWebpage(url, homeUrl, processed)

processWebpage(webpage)
    .then(() => {
        logger.info('\n\nDone!')
        console.timeEnd('program exec time')
    }, err => {
        throw err
    })
