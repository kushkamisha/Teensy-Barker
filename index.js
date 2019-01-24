/* eslint-disable no-console */
'use strict'

// const logger = require('./logger')
const { createWebpage, processWebpage } = require('./lib/webpage')
const urls = require('./lib/urls')

console.time('program exec time')
const url = urls.getUrlFromCLI()
const homeUrl = url

const processed = new Set()
const webpage = createWebpage(url, homeUrl, processed)
const dataFolder = 'data'

processWebpage(webpage, dataFolder)
    .then(() => {
        console.timeEnd('program exec time')
    }, err => {
        throw err
    })
