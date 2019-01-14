'use strict'

/* eslint-disable no-console */
const { createWebpage, processWebpage } = require('./lib/urls')
const { getUrl } = require('./lib/utils')

const url = getUrl()
const homeUrl = url

// const processed = new Set()
const processed = new Set()
const webpage = createWebpage(url, homeUrl, processed)

processWebpage(webpage)
    .then(() => {
        // console.log(webpage)
        console.log('done')
    }, err => {
        throw err
    })
