/**
 * Urls module
 * @module lib/urls
 */

'use strict'

const debug = require('debug')('namespace')

/* eslint-disable no-console */
const request = require('request')
const cheerio = require('cheerio')

const { getUrl, isMenuUrl } = require('./utils')

/**
 * Get valid url from cheerio object
 * @param {Object} url - Cheerio url's object
 * @param {string} homepage - Website's homepage url
 * @returns {string} Valid url
 */
const getHref = (url, homepage) => {
    try {
        let href = url.attribs.href
        if (href.length <= 1)
            return ''
        if (href[0] === '/')
            href = homepage.concat(href)
        return href
    } catch (err) {
        return ''
    }
}

/**
 * Process url's cheerio objects and add urls to the menu webpages or files to
 * the toProcess set in the Website object
 * @param {Array.<Object>} urls - Array of cheerio objects with urls
 * @param {string} homeUrl - Website's homepage url
 * @param {Set.<string>} toProcess - Set of urls to be processed
 */
const processUrls = (urls, { homeUrl, toProcess }) => {
    for (const i in urls) {
        const href = getHref(urls[i], homeUrl)
        if (isMenuUrl(href, homeUrl))
            toProcess.add(href)
    }
}

/**
 * Find all urls to menu file on the website and download them
 * @param {Object} website - Object, which contains all necessary info about 
 * current website
 */
const processWebsite = website => {
    request(website.homeUrl)
        .on('error', err => {
            throw err
        })
        .on('response', res => {
            if (res.statusCode !== 200)
                throw new Error('Invalid status code')
        })
        .on('data', data => {
            debug('some data has been received')
            const html = data.toString('utf8')
            const $ = cheerio.load(html)
            const urls = $('a')
            processUrls(urls, website)
        })
        .on('complete', () => {
            console.log(website)
        })
}

module.exports = {
    getUrl,
    processWebsite,
}
