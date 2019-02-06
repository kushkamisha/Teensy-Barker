/**
 * Utils module
 * @module lib/utils
 */

'use strict'

const fs = require('fs')
const path = require('path')
const request = require('request')

const Html2Pdf = require('./html2pdf')
const logger = require('../logger')

/**
 * Check is given value is an empty array
 * @param {*} arr - Any type value
 * @returns {boolean} True if array is empty
 */
const isEmptyArray = arr => Array.isArray(arr) && arr.length === 0

/**
 * Create folder with given name if it isn't exist
 * @param {string} name - Name of the folder
 * @returns {Promise} Status of folder creation
 */
const mkdir = name => new Promise((resolve, reject) => {
    if (!fs.existsSync(name))
        fs.mkdir(name, err => {
            if (err) reject(err)
            resolve('success')
        })
    else
        resolve('Folder already exists')
})

/**
 * Deletes folder with all folders and files in it
 * @param {string} dirname - Name of the folder
 * @returns {Promise} Status of removing a directory
 */
const rmdir = dirname => new Promise((resolve, reject) => {
    if (fs.existsSync(dirname)) {
        if (!fs.lstatSync(dirname).isDirectory())
            reject('You are trying to delete a file')

        const files = fs.readdirSync(dirname, { withFileTypes: true })
        for (const file of files) {
            if (file.isDirectory())
                rmdir(dirname + '/' + file.name)
            else
                fs.unlinkSync(dirname + '/' + file.name)
        }
        fs.rmdirSync(dirname)
        resolve('success')
    } else {
        resolve('There is no such folder')
    }
})

/**
 * Get site name from any deep it's url
 * @param {string} url - Website url
 * @returns {string} Website's name
 */
const getHomeUrlName = url => {
    const rgx = new RegExp(/^(https?:\/\/)|(www.)/g)
    url = url.replace(rgx, '')

    if (url.indexOf('/') !== -1)
        url = url.slice(0, url.indexOf('/'))

    return url
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

    // Get rid of the file extension
    const rgx = new RegExp(/(\.html ?)|(\.php)/g)
    url = url.replace(rgx, '')

    return url
}

/**
 * Generate name for pdf file from url
 * @param {string} url - Website url
 * @param {string} folder - Folder, which will contain pdf file
 * @returns {string} Full name (with path) for pdf file
 */
const getPdfNameFromUrl = (url, folder) => {
    return `${folder}/${getNameFromUrl(url)}.pdf`
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
 * Saves file using response object. If response is to pdf or image file than it
 * saves file to the dataFolder from the response. If it's necessary - creates
 * dataFolder
 * @param {Object} res - Response object
 * @param {string} dataFolder - Folder where file should be saved
 * @returns {boolean} - Status of whether response links to the file or not
 */
const saveFileFromResponse = async (res, dataFolder) => {
    const fileType = getFileTypeFromUrl(res.headers['content-type'])
    const filePath = res.request.path

    // Create folder for data if not exists
    await mkdir(dataFolder)

    // If url is to the file (not html) => save it
    if (fileType) {
        const filename = path.join(
            __dirname,
            '..',
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
 * @param {string} dataFolder - Name (without path) of folder to store created 
 * pdf
 * @returns {Promise} Status of pdf creation
 */
const createPdfFromUrl = ({ url }, dataFolder) =>
    new Promise((response, reject) => {

        const pdfName = getPdfNameFromUrl(url, dataFolder)
        logger.debug(`Creation of ${pdfName} from ${url}`)

        const html2pdf = new Html2Pdf(url, pdfName)
        html2pdf.processUrl()
            .then(() => {
                logger.debug(`End creating pdf: ${url}`)
                html2pdf.cleanUp()
                response(`success: ${url}`)
            })
            .catch(err => {
                html2pdf.cleanUp()
                reject(err)
            })
    })

/**
 * Convert suburl in the url to the URI format to avoid non-english characters
 * @param {string} url - Input URL
 * @returns {string} URL with last part encoding according to the URI format
 */
const urlToUri = url => {
    let suburl = url.slice(url.lastIndexOf('/') + 1)
    const restOfUrl = url.slice(0, url.lastIndexOf('/') + 1)
    suburl = encodeURIComponent(suburl)

    return `${restOfUrl}${suburl}`
}

/**
 * Get scheme from URI (http, https, ...)
 * @param {string} url - Input URL
 * @returns {string} URI scheme
 */
const getUrlScheme = url => {
    const rgx = new RegExp(/^(https?)/g)
    return url.match(rgx) ? url.match(rgx) : 'http'
}

/**
 * Download image from url to the data folder
 * @param {string} url - Link to the image
 * @param {string} dataFolder - Folder where to put image after downloading
 * @returns {Promise} Result of image downloading
 */
const downloadImage = (url, dataFolder) =>
    new Promise((resolve, reject) => {
        request(url)
            .on('error', err => {
                reject(err)
            })
            .on('response', async res => {
                if (res.statusCode !== 200)
                    reject('Invalid status code')

                const fileType = getFileTypeFromUrl(res.headers['content-type'])
                const filePath = res.request.path

                // Create folder for data if not exists
                await mkdir(dataFolder)

                // If url is to the file (not html) => save it
                if (fileType) {
                    const filename = path.join(
                        __dirname,
                        '..',
                        dataFolder,
                        filePath.slice(filePath.lastIndexOf('/') + 1)
                    )

                    const out = fs.createWriteStream(filename)
                    res.pipe(out)
                }
            })
            .on('complete', () => {
                resolve()
            })
    })

module.exports = {
    isEmptyArray,
    mkdir,
    rmdir,
    getHomeUrlName,
    getNameFromUrl,
    getPdfNameFromUrl,
    getFileTypeFromUrl,
    saveFileFromResponse,
    createPdfFromUrl,
    urlToUri,
    getUrlScheme,
    downloadImage,
}
