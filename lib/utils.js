/**
 * Utils module
 * @module lib/utils
 */

'use strict'

const fs = require('fs')
const path = require('path')

const Html2Pdf = require('./html2pdf')
const logger = require('../logger')

/**
 * Check is given value is an empty array
 * @param {*} arr - Any type value
 * @returns {boolean} True if array is empty
 */
const isEmptyArray = arr => Array.isArray(arr) && arr.length === 0

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
 * Deletes folder with all folders and files in it
 * @param {string} dirname - Name of the folder
 */
const rmDir = dirname => {
    if (fs.existsSync(dirname)) {
        const files = fs.readdirSync(dirname, { withFileTypes: true })
        for (const file of files) {
            if (file.isDirectory())
                rmDir(dirname + '/' + file.name)
            else
                fs.unlinkSync(dirname + '/' + file.name)
        }
        fs.rmdirSync(dirname)
    }
}

/**
 * Generate name for pdf file from url
 * @param {string} url - Website url
 * @param {string} homeUrl - Website's home url
 * @param {string} folder - Folder, which will contain pdf file
 * @returns {string} Full name (with path) for pdf file
 */
const getPdfNameFromUrl = (url, homeUrl, folder) => {
    if (url.substr(-1) === '/')
        url = url.slice(0, -1)
    url = url.slice(url.lastIndexOf('/') + 1)

    return `${folder}/${url}.pdf`
}

/**
 * Create folder name from url
 * @param {string} url - Input url
 * @returns {string} Generated foldername
 */
const getNameFromUrl = url => {
    if (url.slice(-1) === '/')
        url = url.slice(0, -1)
    url = url.replace('www.', '')
    url = url.slice(url.lastIndexOf('/') + 1)

    return url
}

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
 * If url is to pdf or image file => save file from the url
 * @param {Object} res - Response object
 * @param {string} dataFolder - Folder where file should be saved
 * @returns {boolean} - Whether url is to the file or not
 */
const saveFileFromUrl = (res, dataFolder) => {
    const fileType = getFileTypeFromUrl(res.headers['content-type'])
    const filePath = res.request.path

    // Create folder for data if not exists
    createFolder(dataFolder)

    // If url is to the file (not html) => save it
    if (fileType) {
        const filename = path.join(
            __dirname,
            '../', // '..'
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
 * Create pdf from url
 * @param {string} url - Url to be processed
 */
const createPdfFromUrl = ({ url, homeUrl }, dataFolder) =>
    new Promise((response, reject) => {

        const pdfName = getPdfNameFromUrl(url, homeUrl, dataFolder)
        logger.warn(`Creation of ${pdfName} from ${url}`)

        const html2pdf = new Html2Pdf(url, pdfName)
        html2pdf.processUrl()
            .then(async () => {
                logger.info(`End creating pdf: ${url}`)
                await html2pdf.cleanUp()
                response(`success: ${url}`)
            })
            .catch(err => {
                html2pdf.cleanUp()
                reject(err)
            })
    })

module.exports = {
    isEmptyArray,
    createFolder,
    rmDir,
    getPdfNameFromUrl,
    getNameFromUrl,
    getFileTypeFromUrl,
    saveFileFromUrl,
    createPdfFromUrl,
}
