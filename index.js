/* eslint-disable no-console */
'use strict'

const { createWebpage, processWebpage } = require('./lib/webpage')
const { getUrlsFromCLI } = require('./lib/urls')
const { getNameFromUrl, mkdir } = require('./lib/utils')
const logger = require('./logger')

// console.time('program exec time')

getUrlsFromCLI()
    .then(urls => {
        for (const url of urls) {
            const homeUrl = url

            const processed = new Set()
            const webpage = createWebpage(url, homeUrl, processed)

            const dataFolder = 'data'
            mkdir(dataFolder)
            const siteFolder = dataFolder + '/' + getNameFromUrl(homeUrl)

            processWebpage(webpage, siteFolder)
                .then(res => {
                    logger.info(res)
                }, err => {
                    logger.error(err)
                })
        }
    })
