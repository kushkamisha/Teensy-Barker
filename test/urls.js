/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
'use strict'

const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')
const chai = require('chai')
const request = require('request')

const urls = require('../lib/urls')
const { createWebpage } = require('../lib/webpage')

const should = chai.should()
const expect = chai.expect

describe('isValidUrl', () => {

    it('should be true with complete url', () => {
        const url = 'https://www.github.com/'
        expect(urls.isValidUrl(url)).to.equal(true)
    })

    it('should be true without \'www\'', () => {
        const url = 'https://www.github.com/'
        expect(urls.isValidUrl(url)).to.equal(true)
    })

    it('should be true with \'http\'', () => {
        const url = 'http://www.github.com/'
        expect(urls.isValidUrl(url)).to.equal(true)
    })

    it('should be true with url without \'http\'', () => {
        const url = 'www.github.com'
        expect(urls.isValidUrl(url)).to.equal(true)
    })

    it('should be true with url without \'http\' & \'www\'', () => {
        const url = 'github.com'
        expect(urls.isValidUrl(url)).to.equal(true)
    })

    it('should be true with url with dashes', () => {
        const url = 'http://git-hub.com'
        expect(urls.isValidUrl(url)).to.equal(true)
    })

    it('should be false with url with incomplete \'http\' - 1', () => {
        const url = 'htt://www.github.com'
        expect(urls.isValidUrl(url)).to.equal(false)
    })

    it('should be false with url with incomplete \'http\' - 2', () => {
        const url = '://www.github.com'
        expect(urls.isValidUrl(url)).to.equal(false)
    })

    it('should be false with domain with one letter', () => {
        const url = 'http://g.c'
        expect(urls.isValidUrl(url)).to.equal(false)
    })

})

describe('prettifyUrl', () => {

    it('should add \'http\' to the url', () => {
        const url = 'www.github.com/'
        const prettified = 'http://www.github.com/'
        expect(urls.prettifyUrl(url)).to.equal(prettified)
    })

    it('should add \'www\' to the url', () => {
        const url = 'http://github.com/'
        const prettified = 'http://www.github.com/'
        expect(urls.prettifyUrl(url)).to.equal(prettified)
    })

    it('should add slash to the url', () => {
        const url = 'http://www.github.com'
        const prettified = 'http://www.github.com/'
        expect(urls.prettifyUrl(url)).to.equal(prettified)
    })

    it('should add \'http\', \'www\' and slash to the url', () => {
        const url = 'github.com'
        const prettified = 'http://www.github.com/'
        expect(urls.prettifyUrl(url)).to.equal(prettified)
    })

})

describe('getUrlsFromPage', () => {

    it('should find urls on the page (type Buffer)', function(done) {
        this.timeout(5000)

        const url = 'https://httpstatuses.com/'
        const numOfUrls = 66
        const chunks = []

        request(url)
            .on('error', err => {
                done(new Error(err))
            })
            .on('data', chunk => {
                chunks.push(chunk)
            })
            .on('complete', () => {
                const page = Buffer.concat(chunks)
                const links = urls.getUrlsFromPage(page)

                expect(links.length).to.equal(numOfUrls)
                done()
            })
    })

    it('should find urls on the page (type string)', function (done) {
        this.timeout(5000)

        const url = 'https://httpstatuses.com/'
        const numOfUrls = 66
        const chunks = []

        request(url)
            .on('error', err => {
                done(new Error(err))
            })
            .on('data', chunk => {
                chunks.push(chunk)
            })
            .on('complete', () => {
                const page = Buffer.concat(chunks)
                const html = page.toString('utf8')
                const links = urls.getUrlsFromPage(page)

                expect(links.length).to.equal(numOfUrls)
                done()
            })
    })

})

describe('getUrlFromCLI', () => {

    let args = []

    before(() => {
        args = [...process.argv] // deep copy of array
    })

    afterEach(() => {
        process.argv = [...args]
    })

    it('should use default url when it\'s not provided', () => {
        urls.getUrlFromCLI().should.equal('http://www.santori.com.ua/')
    })

    it('should use provided url', () => {
        process.argv.push('-url')
        process.argv.push('http://www.orlypark.com.ua/')
        urls.getUrlFromCLI().should.equal('http://www.orlypark.com.ua/')
    })

})

describe('getHref', () => {

    const getCheerioUrl = link => {
        const html = link.toString('utf8')
        const $ = cheerio.load(html)
        
        return $('a')
    }

    it('should extract href from cheerio object', () => {
        const link = '<a class="link-overlay" href="https://gist.github.com/\
philleonard0/8322dc673d868f9a0faafaba692ac943">< span class="link" > View \
< strong > gist: 8322dc673d868f9a0faafaba692ac943</strong ></span ></a >'
        const homeurl = 'https://gist.github.com/'
        const hrefShouldBe = 'https://gist.github.com/philleonard0/\
8322dc673d868f9a0faafaba692ac943'

        const url = getCheerioUrl(link)[0]
        const href = urls.getHref(url, homeurl)

        expect(href).to.equal(hrefShouldBe)
    })

    it('should add homeurl if internal url', () => {
        const link = '<a class="btn btn-primary" \
data-ga-click="Header, sign up" href="/join?source=header-gist">Sign up</a>'
        const homeurl = 'https://gist.github.com/'
        const hrefShouldBe = 'https://gist.github.com/join?source=header-gist'

        const url = getCheerioUrl(link)[0]
        const href = urls.getHref(url, homeurl)

        expect(href).to.equal(hrefShouldBe)
    })

    it('should return empty string if href\'s length is zero', () => {
        const link = '<a class="btn btn-primary" \
data-ga-click="Header, sign up" href="">Sign up</a>'
        const homeurl = 'https://gist.github.com/'
        const hrefShouldBe = ''

        const url = getCheerioUrl(link)[0]
        const href = urls.getHref(url, homeurl)

        expect(href).to.equal(hrefShouldBe) 
    })

})

describe('isMenuUrl', () => {

    it('should return false for empty url', () => {
        const url = ''
        const homeUrl = ''
        urls.isMenuUrl(url, homeUrl).should.equal(false)
    })

    it('should return false if url is for another website', () => {
        const url = 'http://orlypark.com.ua/menu/'
        const homeUrl = 'http://www.puzatahata.ua/'
        urls.isMenuUrl(url, homeUrl).should.equal(false)
    })

    it('should return true if url is to the menu file or webpage', () => {
        const url = 'http://orlypark.com.ua/menu/'
        const homeUrl = 'http://orlypark.com.ua/'
        urls.isMenuUrl(url, homeUrl).should.equal(true)
    })
})

describe('processUrls', () => {

    const getLinks = filename => {
        const website = path.join(__dirname, 'data', filename)
        const html = fs.readFileSync(website)
        return urls.getUrlsFromPage(html)
    }

    it('should add menu links to toProcess and all links to processed sets',
        () => {
            const url = 'http://orlypark.com.ua/'
            const links = getLinks('orlypark.html')
            const webpage = createWebpage(url, url, new Set())

            const toProcess = new Set([
                'http://orlypark.com.ua/menu/',
                'http://orlypark.com.ua/menu/kuhnya/',
                'http://orlypark.com.ua/menu/detskoe-menyu/',
                'http://orlypark.com.ua/menu/sushi/',
                'http://orlypark.com.ua/menu/deserti/',
                'http://orlypark.com.ua/menu/bar/'
            ])
            const processed = new Set([
                'http://orlypark.com.ua/restaurant/',
                'http://orlypark.com.ua/hotel/',
                'http://orlypark.com.ua/hotel/standart/',
                'http://orlypark.com.ua/hotel/polu-lyuks/',
                'http://orlypark.com.ua/hotel/lyuks/',
                'http://orlypark.com.ua/detskij-klub/',
                'http://orlypark.com.ua/gallery/',
                'http://orlypark.com.ua/news/',
                'http://orlypark.com.ua/uslugi/',
                'http://orlypark.com.ua/reviews/',
                'http://orlypark.com.ua/kontakti/',
                'http://orlypark.com.ua/',
                'http://orlypark.com.ua/#',
                'http://orlypark.com.ua/stocks/biznes-vremya-v-orly-park.html',
                'http://orlypark.com.ua/stocks/spetsialnoe-predlozhenie-dlya-\
provedeniya-svadeb.html',
                'https://www.facebook.com/orlypark',
                'https://twitter.com/orly_park',
                'http://vk.com/orlypark'
            ])
            
            urls.processUrls(links, webpage)
            
            expect(webpage.toProcess).to.eql(toProcess)
            expect(webpage.processed).to.eql(processed)
        })

    it('should add nothing if no links to menu', () => {
        const url = 'https://gist.github.com/'
        const links = getLinks('gist.github.html')
        const webpage = createWebpage(url, url, new Set())

        const toProcess = new Set()
        const processedSite = 73

        urls.processUrls(links, webpage)

        expect(webpage.toProcess).to.eql(toProcess)
        expect(webpage.processed.size).to.eql(processedSite)
    })
})
