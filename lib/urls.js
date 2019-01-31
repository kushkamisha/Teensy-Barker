/**
 * Urls module
 * @module lib/urls
 */

'use strict'

const cheerio = require('cheerio')

const { defaultUrl } = require('../config')
const utils = require('./utils')
const db = require('../db')

/**
 * Check is provided url is in valid format
 * @param {string} url - Input url
 * @returns {boolean} Is url valid or not
 */
const isValidUrl = url => {
    const rgx = new RegExp([
        // eslint-disable-next-line no-useless-escape
        '^(https?:\/\/(www\.)?)?',
        // eslint-disable-next-line no-useless-escape
        '[a-z0-9]+([\-\.]{1}[a-z0-9]+)*',
        // eslint-disable-next-line no-useless-escape
        '\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$'].join(''), 'g')
    return !!url.match(rgx)
}

/**
 * Add 'http', 'www' and slash to the beginning and slash to the end of the url
 * if nesessary
 * @param {string} url - Input url
 * @returns {string} Prettifyed url
 */
const prettifyUrl = url => {
    const withHttp = /^(https?:\/\/)/g
    const withWwwAndHttp = /^(https?:\/\/(www\.))/g

    // add 'http'
    if (!url.match(withHttp))
        url = 'http://' + url

    // add 'www'
    if (!url.match(withWwwAndHttp)) {
        const pos = url.match(withHttp)[0].length // position to insert
        url = url.slice(0, pos) + 'www.' + url.slice(pos)
    }

    // add slash to the end
    if (url.substr(-1) !== '/')
        url = url.concat('/')

    return url
}

/**
 * Find all <a> tags in the webpage
 * @param {(Buffer|string)} page - Buffer of the webpage
 * @returns {Object} All <a> tags from the webpage
 */
const getUrlsFromPage = page => {
    const html = page.toString('utf8')
    const $ = cheerio.load(html)

    return $('a')
}

/**
 * Find all <img> tags in the webpage
 * @param {(Buffer|string)} page - Buffer of the webpage
 * @returns {Object} All <img> tags from the webpage
 */
const getImagesFromPage = page => {
    const html = page.toString('utf8')
    const $ = cheerio.load(html)

    return $('img')
}

/**
 * Get url given by user as CLI param or using the default one
 * @returns {string} Url to be used in the program
 */
const getUrlsFromCLI = async () => {
    const args = process.argv.slice(2)
    const command = utils.isEmptyArray(args) ? '' : args.shift()
    const params = utils.isEmptyArray(args) ? [defaultUrl] : args
    let urls = []
    let res = {}

    const cmds = {
        URL: '-url',
        DB: '-db'
    }

    switch (command) {
        case cmds.URL:
            urls.push(params[0])
            break
        case cmds.DB:
            await db.open()
            res = await db.query('SELECT "Website" from "Places"')
            urls = res.rows.map(x => x.Website).filter(x => x)
            await db.close()
            break
        default:
            urls.push(defaultUrl)
    }

    for (const i in urls) {
        if (!isValidUrl(urls[i]))
            urls[i] = defaultUrl
        urls[i] = prettifyUrl(urls[i])
    }

    return urls
}

/**
 * Get valid url from cheerio object
 * @param {Object} url - Cheerio url's object
 * @param {string} homepage - webpage's homepage url
 * @returns {string} Valid url
 */
const getHref = (url, homepage) => {
    if (!url.attribs) return ''
    if (!url.attribs.href) return ''

    const href = url.attribs.href

    if (href.indexOf('http') !== 0)
        return homepage.concat(href[0] === '/' ? href.slice(1) : href)

    return href
}

/**
 * Get valid link to the image from cheerio object
 * @param {Object} img - Cheerio img's object
 * @param {string} homepage - webpage's homepage url
 * @returns {string} Valid link to the image
 */
const getImgSrc = (img, homepage) => {
    if (!img.attribs) return ''
    if (!img.attribs.src) return ''

    const src = img.attribs.src

    if (src.indexOf('http') !== 0)
        return homepage.concat(src[0] === '/' ? src.slice(1) : src)

    return src
}

/**
 * Check is given url is to the menu file or webpage
 * @param {string} url - Url to be checked
 * @param {string} homeUrl - Website's homepage url
 * @returns {boolean} True if url is on the menu file or webpage
 */
const isMenuUrl = (url, homeUrl) => {
    if (!url) return false
    if (!url.includes(homeUrl)) return false

    const MENU = ['menyu', 'menu', 'kitchen']

    for (const item of MENU) {
        if (url.includes(item))
            return true
    }

    return false
}

/**
 * Process url's cheerio objects and add urls to the menu webpages or files to
 * the toProcess set in the webpage object
 * @param {Array.<Object>} links - Array of cheerio objects with urls
 * @param {string} homeUrl - webpage's homepage url
 * @param {Set.<string>} toProcess - Set of urls to be processed
 * @param {Set.<string>} processed - Set of urls which have been already processed
 */
const processUrlsObjects = (links, { homeUrl, toProcess, processed }) => {
    for (const i in links) {
        const href = getHref(links[i], homeUrl)
        if (!href) continue

        if (isMenuUrl(href, homeUrl) && !processed.has(href))
            toProcess.add(href)
        else
            processed.add(href)
    }
}

/**
 * Process img's cheerio objects and download images to the menus.
 * @param {Array.<Object>} imgs - Array of cheerio img objects
 * @returns {Promise} Result of downloading image from url
 */
const processImagesObjects = (imgs, { homeUrl }, dataFolder) => 
    new Promise((resolve, reject) => {
        const toDownload = []
        for (const i in imgs) {
            const src = getImgSrc(imgs[i], homeUrl)
            if (!src) continue

            if (isMenuUrl(src, homeUrl))
                toDownload.push(utils.downloadImage(src, dataFolder))
        }
        Promise.all(toDownload)
            .then(() => {
                resolve()
            }, err => {
                reject(err)
            })
    })

module.exports = {
    isValidUrl,
    prettifyUrl,
    getUrlsFromPage,
    getImagesFromPage,
    getUrlsFromCLI,
    getHref,
    getImgSrc,
    isMenuUrl,
    processUrlsObjects,
    processImagesObjects,
}
