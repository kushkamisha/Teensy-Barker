/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
const request = require('request')
const cheerio = require('cheerio')

const isEmptyArray = arr => Array.isArray(arr) && arr.length === 0

const getUrl = () => {
    const args = process.argv.slice(2)
    const command = isEmptyArray(args) ? '' : args.shift()
    const defaultUrl = 'http://orlypark.com.ua'
    const params = isEmptyArray(args) ? [defaultUrl] : args
    let url = ''

    const cmds = {
        URL: '-url'
    }
    
    switch (command) {
    case cmds.URL:
        url = params[0]
        break
    default:
        url = defaultUrl
    }

    return url
}

class Website {
    constructor() {
        const url = getUrl()
        this.url = url.substr(-1) === '/' ? url.slice(0, -1) : url
        this.toProcess = new Set()
    }

    isMenuUrl (url) {
        if (!url) return false
        return true
    }
    
    getHref (url) {
        try {
            let href = url.attribs.href
            if (href.length <= 1)
                return ''
            if (href[0] === '/')
                href = this.url.concat(href)
            return href
        } catch (err) {
            return ''
        }
    }
    
    processUrls (urls) {
        for (const i in urls) {
            const href = this.getHref(urls[i])
            if (this.isMenuUrl(href))
                this.toProcess.add(href)
        }
    }
}

const website = new Website()

request(website.url)
    .on('error', err => {
        throw err
    })
    .on('response', res => {
        if (res.statusCode !== 200)
            throw new Error('Invalid status code')
    })
    .on('data', data => {
        const html = data.toString('utf8')
        const $ = cheerio.load(html)
        const urls = $('a')
        website.processUrls(urls)
    })
    .on('complete', () => {
        console.log(website)
    })
