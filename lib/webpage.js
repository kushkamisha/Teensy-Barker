/**
 * Webpage module
 * @module lib/webpage
 */
'use strict'

const request = require('request')
const utils = require('./utils')
const urls = require('./urls')

/**
 * Create webpage object
 * @param {string} url - URL of the current webpage
 * @param {string} homeUrl - URL of the website's homepage 
 * @param {Set} processed - List of processed URls
 * @returns {Object} Created object
 */
const createWebpage = (url, homeUrl, processed) => ({
    url,
    homeUrl,
    toProcess: new Set(),
    processed
})

/**
 * Cheate child webpage objects from urls, which were detected as menu urls.
 * @param {Object} webpage - Webpage object
 * @returns {Array.<Object>} - Array of child webpage objects
 */
const createChildWebpages = webpage => {
    const pages = []
    for (const url of webpage.toProcess) {
        const newPage = createWebpage(
            url,
            webpage.homeUrl,
            new Set([
                ...webpage.toProcess, ...webpage.processed
            ]))
        pages.push(newPage)
    }

    return pages
}

/**
 * Find all urls to menu file on the webpage and download them
 * @param {Object} webpage - Object, which contains all necessary info about 
 * current webpage
 */
const processWebpage = webpage => new Promise((response, reject) => {

    const dataFolder = 'data'

    request(webpage.url)
        .on('error', err => {
            reject(err)
        })
        .on('response', res => {
            if (res.statusCode !== 200)
                throw new Error('Invalid status code')

            // Save current webpage as pdf or download it if it's a file
            if (!utils.saveFileFromUrl(res, dataFolder))
                if (webpage.url !== webpage.homeUrl)
                    utils.createPdfFromUrl(webpage, dataFolder)
        })
        .on('data', chunk => {
            // Process chunk
            const links = urls.getUrlsFromChunk(chunk)
            urls.processUrls(links, webpage)
        })
        .on('complete', () => {
            // Create child webpages if needed
            if (!webpage.toProcess) response()
            const pages = createChildWebpages(webpage)

            Promise.all(pages.map(processWebpage))
                .then(() => response())
        })
})

module.exports = {
    createWebpage,
    processWebpage,
}
