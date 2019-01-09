const request = require('request')
const $ = require('cheerio')

const url = 'http://orlypark.com.ua/'

function Website(url) {
    this.url = url
    this.toProcess = new Set()
}

const website = new Website(url)

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
        const items = $('a', html)
        for (const i in items) {
            try {
                website.toProcess.add(items[i].attribs.href)
            } catch(err) {
                //
            }
        }
    })
    .on('complete', () => {
        console.log(website)
    })