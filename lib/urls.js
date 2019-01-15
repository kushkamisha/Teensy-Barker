/**
 * Urls module
 * @module lib/urls
 */

'use strict'

const request = require('request')
const cheerio = require('cheerio')

// const logger = require('../logger')
const { 
    isMenuUrl,
    createChildWebpages,
    processCurrentWebpage
} = require('./utils')

/**
 * Find all <a> tags from the webpage chunk
 * @param {Object} chunk - Chunk of the webpage
 * @returns {Object} All <a> tags from the chunk
 */
const getUrlsFromChunk = chunk => {
    const html = chunk.toString('utf8')
    const $ = cheerio.load(html)

    return $('a')
}

/**
 * Get valid url from cheerio object
 * @param {Object} url - Cheerio url's object
 * @param {string} homepage - webpage's homepage url
 * @returns {string} Valid url
 */
const getHref = (url, homepage) => {
    if (!url.attribs)  return ''
    if (!url.attribs.href) return ''

    const href = url.attribs.href
    if (href.length <= 1)
        return ''
    if (href[0] === '/')
        return homepage.concat(href.slice(1))

    return href
}

/**
 * Process url's cheerio objects and add urls to the menu webpages or files to
 * the toProcess set in the webpage object
 * @param {Array.<Object>} urls - Array of cheerio objects with urls
 * @param {string} homeUrl - webpage's homepage url
 * @param {Set.<string>} toProcess - Set of urls to be processed
 */
const processUrls = (urls, { homeUrl, toProcess, processed }) => {
    for (const i in urls) {
        const href = getHref(urls[i], homeUrl)
        if (!href) continue
        if (isMenuUrl(href, homeUrl) && !processed.has(href))
            toProcess.add(href)
        else
            processed.add(href)
    }
}

/**
 * Find all urls to menu file on the webpage and download them
 * @param {Object} webpage - Object, which contains all necessary info about 
 * current webpage
 */
const processWebpage = webpage => new Promise((response, reject) => {
    request(webpage.url)
        .on('error', err => {
            reject(err)
        })
        .on('response', res => {
            if (res.statusCode !== 200)
                throw new Error('Invalid status code')
        })
        .on('data', chunk => {
            // Process chunk
            const urls = getUrlsFromChunk(chunk)
            processUrls(urls, webpage)
        })
        .on('complete', () => {
            processCurrentWebpage(webpage)

            // Create child webpages if needed
            if (!webpage.toProcess) response()
            const pages = createChildWebpages(webpage)

            Promise.all(pages.map(processWebpage))
                .then(() => response())
        })
})

module.exports = {
    processWebpage,
}
