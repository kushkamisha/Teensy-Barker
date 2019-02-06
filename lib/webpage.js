/**
 * Webpage module
 * @module lib/webpage
 */

'use strict'

const request = require('request')

const utils = require('./utils')
const urls = require('./urls')
const logger = require('../logger')

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
const processWebpage = (webpage, dataFolder) => new Promise((response, reject) => {

    let creatingPdf = false
    const chunks = []

    request(webpage.url)
        .on('error', err => {
            reject(err)
        })
        .on('response', res => {
            if (res.statusCode !== 200)
                reject('Invalid status code')

            // Save current webpage as pdf or download it if it's a file
            if (!utils.saveFileFromResponse(res, dataFolder))
                if (webpage.url !== webpage.homeUrl)
                    creatingPdf = true
        })
        .on('data', chunk => {
            chunks.push(chunk)
        })
        .on('complete', () => {
            // Process chunk
            const page = Buffer.concat(chunks)
            const links = urls.getUrlsFromPage(page)
            const imgs = urls.getImagesFromPage(page)

            urls.processUrlObjects(links, webpage)
            urls.processImagesObjects(imgs, webpage, dataFolder)
                .catch(() => {
                    logger.error(`Can't download the image`)
                })

            // Response if there is no need to create child webpages
            if (!creatingPdf && !webpage.toProcess.size)
                response(`success: ${webpage.url}`)

            const pages = createChildWebpages(webpage)
            const forPromise = []

            for (const page of pages)
                forPromise.push(processWebpage(page, dataFolder))

            if (creatingPdf)
                forPromise.push(utils.createPdfFromUrl(webpage, dataFolder))

            // Process child webpages & download this as pdf if needed
            Promise.all(forPromise)
                .then(() => response(`success: ${webpage.url}`))
                .catch(err => reject(err))
        })
})

module.exports = {
    createWebpage,
    createChildWebpages,
    processWebpage,
}
