/**
 * Urls module
 * @module lib/urls
 */

'use strict'

const cheerio = require('cheerio')

const { defaultUrl } = require('../config')

/**
 * Get file extension from from Content-Type parameter
 * @param {string} contentType - Content-Type of the response from http request
 * @returns {string} Resulting file extension
 */
const getFileTypeFromUrl = contentType => {
    let type = ''
    const extensions = {
        pdf: '.pdf',
        jpg: '.jpg',
        png: '.png',
        bmp: '.bmp',
        tiff: '.tiff',
        svg: '.svg',
        gif: '.gif',
        mdi: '.mdi',
        pjpeg: '.pjpeg',
        ico: '.ico'

    }
    switch (contentType) {
        case ('application/pdf'): type = extensions.pdf; break
        case ('image/jpeg'): type = extensions.jpg; break
        case ('image/x-citrix-jpeg'): type = extensions.jpg; break
        case ('image/png'): type = extensions.png; break
        case ('image/x-citrix-png'): type = extensions.png; break
        case ('image/x-png'): type = extensions.png; break
        case ('image/bmp'): type = extensions.bmp; break
        case ('image/tiff'): type = extensions.tiff; break
        case ('image/svg+xml'): type = extensions.svg; break
        case ('image/gif'): type = extensions.gif; break
        case ('image/vnd.ms-modi'): type = extensions.mdi; break
        case ('image/pjpeg'): type = extensions.pjpeg; break
        case ('image/x-icon'): type = extensions.ico; break

        default: type = ''
    }

    return type
}

/**
 * Check is provided url is in valid format
 * @param {string} url - Input url
 * @returns {bool} Is url valid or not
 */
const isValidUrl = url => {
    const rgx = new RegExp([
        // eslint-disable-next-line no-useless-escape
        '^(https?:\/\/(www\.)?)?',
        // eslint-disable-next-line no-useless-escape
        '[a-z0-9]+([\-\.]{1}[a-z0-9]+)*',
        // eslint-disable-next-line no-useless-escape
        '\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$'].join(''), 'g')
    return url.match(rgx)
}

/**
 * Add 'http' and 'www' to the beginning and slash to the end of the url if
 * nesessary
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
 * Get url given by user as CLI param or using the default one
 * @returns {string} Url to be used in the program
 */
const getUrlFromCLI = () => {
    const utils = require('./utils') // SO BAD .....

    const args = process.argv.slice(2)
    const command = utils.isEmptyArray(args) ? '' : args.shift()
    const params = utils.isEmptyArray(args) ? [defaultUrl] : args
    let url = ''

    const cmds = {
        URL: '-url'
    }

    switch (command) {
        case cmds.URL:
            url = prettifyUrl(params[0])
            break
        default:
            url = defaultUrl
    }

    if (!isValidUrl(url)) return defaultUrl

    url = prettifyUrl(url)

    return url
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
    if (href.indexOf('http') !== 0)
        return homepage.concat(href[0] === '/' ? href.slice(1) : href)

    return href
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

module.exports = {
    getFileTypeFromUrl,
    getUrlFromCLI,
    isValidUrl,
    prettifyUrl,
    getUrlsFromChunk,
    processUrls,
}
