/**
 * Utils module
 * @module lib/utils
 */

'use strict'

const { defaultUrl } = require('../config')

/**
 * Check is given value is an empty array
 * @param {*} arr - Any type value
 * @returns {boolean} True if array is empty
 */
const isEmptyArray = arr => Array.isArray(arr) && arr.length === 0

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

module.exports = {
    isEmptyArray,
    formatUrl,
    getUrl,
    isMenuUrl,
}
