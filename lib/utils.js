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
 * Saves pdf or image from url to the file
 * @param {Object} res - Response object
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
 * Create pdf from url
 * @param {string} url - Url to be processed
 */
const createPdfFromUrl = ({ url, homeUrl }, dataFolder) =>
    new Promise((response, reject) => {

        const pdfName = getPdfNameFromUrl(url, homeUrl, dataFolder)
        logger.warn(`Creation of ${pdfName} from ${url}`)

        const html2pdf = new Html2Pdf(url, pdfName)
        html2pdf.processUrl()
            .then(() => {
                response(`success: ${url}`)
                html2pdf.cleanUp()
            })
            .catch(err => {
                html2pdf.cleanUp()
                reject(err)
            })
    })

module.exports = {
    isEmptyArray,
    saveFileFromUrl,
    createPdfFromUrl,
}
