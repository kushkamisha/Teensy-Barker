/**
 * Utils module
 * @module lib/utils
 */

'use strict'

const fs = require('fs')
const SitePDF = require('site-pdf')

const generator = new SitePDF()
const { defaultUrl } = require('../config')
const logger = require('../logger')

/**
 * Check is given value is an empty array
 * @param {*} arr - Any type value
 * @returns {boolean} True if array is empty
 */
const isEmptyArray = arr => Array.isArray(arr) && arr.length === 0

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
 * Add slash to the end of the url if needed
 * @param {string} url - Url to be processed
 * @returns {string} Formatted url
 */
const formatUrl = url => url.substr(-1) === '/' ? url : url.concat('/')

/**
 * Get url given by user as CLI param or using the default one
 * @returns {string} Url to be used in the program
 */
const getUrl = () => {
    const args = process.argv.slice(2)
    const command = isEmptyArray(args) ? '' : args.shift()
    const params = isEmptyArray(args) ? [defaultUrl] : args
    let url = ''

    const cmds = {
        URL: '-url'
    }
    
    switch (command) {
    case cmds.URL:
        url = formatUrl(params[0])
        break
    default:
        url = defaultUrl
    }

    return url
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
 * Generate name for pdf file from url
 * @param {String} url - Website url
 * @param {String} homeUrl - Website's home url
 * @returns {String} Created pdf file name
 */
const getPdfNameFromUrl = (url, homeUrl, folder) => {
    if (url.substr(-1) === '/')
        url = url.slice(0, -1)
    // if (url.includes(homeUrl))
    //     url = url.slice(homeUrl.length)
    // url = url.replace(/\//g, '-')
    url = url.slice(url.lastIndexOf('/') + 1)

    return `${folder}/${url}.pdf`
}

/**
 * Create pdf from webpage
 * @param {String} url - Webpage url
 */
const createPdfFromWebpage = ({ url, homeUrl }) => {
    // const dataFolder = 'data'

    // // Create folder for data if not exists
    // if (!fs.existsSync(dataFolder)) {
    //     fs.mkdir(dataFolder, err => {
    //         if (err) throw err
    //     })
    // }

    // const pdfName = getPdfNameFromUrl(url, homeUrl, dataFolder)
    // console.log(`Creation of ${pdfName} from ${url} .....`)

    // generator.create(url, pdfName)
    //     .then(() => {
    //         generator.destroy()
    //     })
}

const processCurrentWebpage = page => {
    // const IMG_FORMATS = ['']
    console.log(page.url)

    if (page.url !== page.homeUrl)
        createPdfFromWebpage(page)

    
}

module.exports = {
    isEmptyArray,
    getFileTypeFromUrl,
    formatUrl,
    getUrl,
    isMenuUrl,
    createWebpage,
    createChildWebpages,
    processCurrentWebpage,
}
