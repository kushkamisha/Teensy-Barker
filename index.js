/* eslint-disable no-console */
'use strict'

const { createWebpage, processWebpage } = require('./lib/webpage')
const { getUrlFromCLI } = require('./lib/urls')
const { getNameFromUrl, createFolder } = require('./lib/utils')
// const logger = require('./logger')

console.time('program exec time')
const url = getUrlFromCLI()
const homeUrl = url

const processed = new Set()
const webpage = createWebpage(url, homeUrl, processed)

const dataFolder = 'data'
createFolder(dataFolder)
const siteFolder = dataFolder + '/' + getNameFromUrl(homeUrl)

processWebpage(webpage, siteFolder)
    .then(() => {
        console.timeEnd('program exec time')
    }, err => {
        throw err
    })
