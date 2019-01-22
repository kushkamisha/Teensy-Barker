/**
 * Utils module
 * @module lib/utils
 */

'use strict'

const fs = require('fs')
const path = require('path')

const Html2Pdf = require('./html2pdf')
const { defaultUrl } = require('../config')
const logger = require('../logger')

/**
 * Check is given value is an empty array
 * @param {*} arr - Any type value
 * @returns {boolean} True if array is empty
 */
const isEmptyArray = arr => Array.isArray(arr) && arr.length === 0

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
 * Create folder with given name if isn't exist
 * @param {string} name - Name of the folder
 */
const createFolder = name => {
    if (!fs.existsSync(name)) {
        fs.mkdir(name, err => {
            if (err) throw err
        })
    }
}

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
 * @param {string} url - Website url
 * @param {string} homeUrl - Website's home url
 * @returns {string} Created pdf file name
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
 * Saves pdf or image from url to the file
 * @param {Object} res - Response object
 */
const saveFileFromUrl = res => {
    const fileType = getFileTypeFromUrl(res.headers['content-type'])
    const filePath = res.request.path

    // Create folder for data if not exists
    const dataFolder = 'data'
    createFolder(dataFolder)

    // If url is to the file (not html) => save it
    if (fileType) {
        const filename = path.join(
            __dirname,
            '../',
            dataFolder,
            filePath.slice(filePath.lastIndexOf('/') + 1)
        )
        const out = fs.createWriteStream(filename)
        res.pipe(out)

        return true
    }

    return false
}

/**
 * Create pdf from webpage
 * @param {string} url - Webpage url
 */
const createPdfFromWebpage = ({ url, homeUrl }) => {
    // // Create folder for data if not exists
    const dataFolder = 'data'
    // createFolder(dataFolder)

    const pdfName = getPdfNameFromUrl(url, homeUrl, dataFolder)
    logger.warn(`Creation of ${pdfName} from ${url} .....`)

    const html2pdf = new Html2Pdf(url, pdfName)
    html2pdf.processUrl()
        .then(() => {
            logger.info(`success: ${url}`)
            html2pdf.cleanUp()
        })
        .catch(err => {
            html2pdf.cleanUp()
            logger.error(err)
        })
}

/**
 * Save pdf files 
 * @param {*} page 
 */
const processCurrentWebpage = page => {
    // const IMG_FORMATS = ['']
    // logger.info(page.url)

    if (page.url !== page.homeUrl)
        createPdfFromWebpage(page)
}

module.exports = {
    isEmptyArray,
    saveFileFromUrl,
    getUrl,
    isMenuUrl,
    createWebpage,
    createChildWebpages,
    processCurrentWebpage,
}
