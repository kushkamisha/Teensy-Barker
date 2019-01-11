'use strict'

/* eslint-disable no-console */
const { Website, processWebsite } = require('./lib/urls')
const { getUrl } = require('./lib/utils')

const url = getUrl()
const homeUrl = url

const website = new Website(url, homeUrl)

processWebsite(website)
    .then(() => {
        console.log(website)
    })
    .catch(err => {
        throw err
    })
