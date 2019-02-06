/* eslint-disable quotes */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
'use strict'

const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')
const chai = require('chai')
const request = require('request')

const urls = require('../lib/urls')
const utils = require('../lib/utils')
const { createWebpage } = require('../lib/webpage')

const should = chai.should()
const expect = chai.expect

describe('isValidUrl', () => {

    it('should be true with complete url', () => {
        const url = 'https://www.github.com/'
        expect(urls.isValidUrl(url)).to.equal(true)
    })

    it(`should be true without 'www'`, () => {
        const url = 'https://www.github.com/'
        expect(urls.isValidUrl(url)).to.equal(true)
    })

    it(`should be true with 'http'`, () => {
        const url = 'http://www.github.com/'
        expect(urls.isValidUrl(url)).to.equal(true)
    })

    it(`should be true with url without 'http'`, () => {
        const url = 'www.github.com'
        expect(urls.isValidUrl(url)).to.equal(true)
    })

    it(`should be true with url without 'http' & 'www'`, () => {
        const url = 'github.com'
        expect(urls.isValidUrl(url)).to.equal(true)
    })

    it('should be true with url with dashes', () => {
        const url = 'http://git-hub.com'
        expect(urls.isValidUrl(url)).to.equal(true)
    })

    it(`should be false with url with incomplete 'http' - 1`, () => {
        const url = 'htt://www.github.com'
        expect(urls.isValidUrl(url)).to.equal(false)
    })

    it(`should be false with url with incomplete 'http' - 2`, () => {
        const url = '://www.github.com'
        expect(urls.isValidUrl(url)).to.equal(false)
    })

    it('should be false with domain with one letter', () => {
        const url = 'http://g.c'
        expect(urls.isValidUrl(url)).to.equal(false)
    })

})

describe('prettifyUrl', () => {

    it(`should add 'http' to the url`, () => {
        const url = 'www.github.com/'
        const prettified = 'http://www.github.com/'
        expect(urls.prettifyUrl(url)).to.equal(prettified)
    })

    it(`should add 'www' to the url`, () => {
        const url = 'http://github.com/'
        const prettified = 'http://www.github.com/'
        expect(urls.prettifyUrl(url)).to.equal(prettified)
    })

    it('should add slash to the url', () => {
        const url = 'http://www.github.com'
        const prettified = 'http://www.github.com/'
        expect(urls.prettifyUrl(url)).to.equal(prettified)
    })

    it(`should add 'http', 'www' and slash to the url`, () => {
        const url = 'github.com'
        const prettified = 'http://www.github.com/'
        expect(urls.prettifyUrl(url)).to.equal(prettified)
    })

})

describe('getUrlsFromPage', () => {

    const getFileContent = filename => {
        const website = path.join(__dirname, 'data', filename)
        return fs.readFileSync(website)
    }

    it('should find urls on the page (type Buffer)', () => {
        const numOfUrls = 28
        const page = getFileContent('orlypark.html')
        const links = urls.getUrlsFromPage(page)

        expect(links.length).to.equal(numOfUrls)
    })

    it('should find urls on the page (type string)', () => {
        const numOfUrls = 28
        const page = getFileContent('orlypark.html').toString('utf8')
        const links = urls.getUrlsFromPage(page)

        expect(links.length).to.equal(numOfUrls)
    })

})

describe('getImagesFromPage', () => {
    const getFileContent = filename => {
        const website = path.join(__dirname, 'data', filename)
        return fs.readFileSync(website)
    }

    it('should find images on the page (type Buffer)', () => {
        const numOfImgs = 12
        const page = getFileContent('orlypark.html')
        const imgs = urls.getImagesFromPage(page)

        expect(imgs.length).to.equal(numOfImgs)
    })

    it('should find images on the page (type string)', () => {
        const numOfImgs = 12
        const page = getFileContent('orlypark.html').toString('utf8')
        const imgs = urls.getImagesFromPage(page)

        expect(imgs.length).to.equal(numOfImgs)
    })
})

describe('getUrlsFromCLI', () => {

    let args = []

    before(() => {
        args = [...process.argv] // deep copy of array
    })

    afterEach(() => {
        process.argv = [...args]
    })

    it(`should use default url when it's not provided`, async () => {
        const links = await urls.getUrlsFromCLI()
        links.should.eql(['http://www.santori.com.ua/'])
    })

    it('should use provided url', async () => {
        process.argv.push('-url')
        process.argv.push('http://www.orlypark.com.ua/')
        const links = await urls.getUrlsFromCLI()
        links.should.eql(['http://www.orlypark.com.ua/'])
    })

    it.skip('should get urls from the database', async () => {
        process.argv.push('-db')
        const links = await urls.getUrlsFromCLI()

        links.should.eql([
            'http://www.santori.com.ua/',
            'http://www.kfc-ukraine.com/',
            'http://www.orlypark.com.ua/',
            'http://www.sushi24.ua/'
        ])
    })

})

describe('getHref', () => {

    const getCheerioUrl = link => {
        const html = link.toString('utf8')
        const $ = cheerio.load(html)
        
        return $('a')
    }

    it('should extract href from cheerio object', () => {
        const link = '<a class="link-overlay" href="https://gist.github.com/' +
                     'philleonard0/8322dc673d868f9a0faafaba692ac943">< span ' +
                     'class="link" > View < strong > gist: 8322dc673d868f9a0' + 
                     'faafaba692ac943</strong ></span ></a >'
        const homeurl = 'https://gist.github.com/'
        const hrefShouldBe = 'https://gist.github.com/philleonard0/8322dc673' +
                             'd868f9a0faafaba692ac943'

        const url = getCheerioUrl(link)[0]
        const href = urls.getHref(url, homeurl)

        expect(href).to.equal(hrefShouldBe)
    })

    it('should add homeurl if internal url', () => {
        const link = '<a class="btn btn-primary" data-ga-click="Header, sign' +
                     ' up" href="/join?source=header-gist">Sign up</a>'
        const homeurl = 'https://gist.github.com/'
        const hrefShouldBe = 'https://gist.github.com/join?source=header-gist'

        const url = getCheerioUrl(link)[0]
        const href = urls.getHref(url, homeurl)

        expect(href).to.equal(hrefShouldBe)
    })

    it(`should return empty string if href's length is zero`, () => {
        const link = '<a class="btn btn-primary" data-ga-click="Header, sign' +
                     ' up" href="">Sign up</a>'
        const homeurl = 'https://gist.github.com/'
        const hrefShouldBe = ''

        const url = getCheerioUrl(link)[0]
        const href = urls.getHref(url, homeurl)

        expect(href).to.equal(hrefShouldBe) 
    })

})

describe('getImgSrc', () => {

    const getCheerioImg = link => {
        const html = link.toString('utf8')
        const $ = cheerio.load(html)

        return $('img')
    }

    it('should extract src from cheerio object', () => {
        const img = '<img alt="Google" src="https://www.google.com/image.jpg">'
        const homeurl = 'https://www.google.com/'
        const srcShouldBe = `${homeurl}image.jpg`

        const imgObj = getCheerioImg(img)[0]
        const src = urls.getImgSrc(imgObj, homeurl)

        expect(src).to.equal(srcShouldBe)
    })

    it('should add homeurl if internal url', () => {
        const img = '<img alt="Google" height="92" id="hplogo" src="/images/' +
                    'branding/googlelogo/2x/googlelogo_color_272x92dp.png" ' +
                    'srcset="/images/branding/googlelogo/1x/googlelogo_color' +
                    '_272x92dp.png 1x, /images/branding/googlelogo/2x/google' + 
                    'logo_color_272x92dp.png 2x" style="padding-top:109px" ' +
                    'width="272" onload="window.lol&amp;&amp;lol()" ' +
                    'data-atf="3">'
        const homeurl = 'https://www.google.com/'
        const srcShouldBe = homeurl + 'images/branding/googlelogo/2x/' +
                                      'googlelogo_color_272x92dp.png'

        const imgObj = getCheerioImg(img)[0]
        const src = urls.getImgSrc(imgObj, homeurl)

        expect(src).to.equal(srcShouldBe)
    })

    it(`should return empty string if src's length is zero`, () => {
        const img = '<img alt="Google" src="">'
        const homeurl = 'https://www.google.com/'
        const srcShouldBe = ''

        const imgObj = getCheerioImg(img)[0]
        const src = urls.getImgSrc(imgObj, homeurl)

        expect(src).to.equal(srcShouldBe)
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

describe('processUrlsObjects', () => {

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
                'http://orlypark.com.ua/stocks/spetsialnoe-predlozhenie-dlya-' +
                    'provedeniya-svadeb.html',
                'https://www.facebook.com/orlypark',
                'https://twitter.com/orly_park',
                'http://vk.com/orlypark'
            ])
            
            urls.processUrlsObjects(links, webpage)
            
            expect(webpage.toProcess).to.eql(toProcess)
            expect(webpage.processed).to.eql(processed)
        })

    it('should add nothing if no links to menu', () => {
        const url = 'https://gist.github.com/'
        const links = getLinks('gist.github.html')
        const webpage = createWebpage(url, url, new Set())

        const toProcess = new Set()
        const processedSite = 73

        urls.processUrlsObjects(links, webpage)

        expect(webpage.toProcess).to.eql(toProcess)
        expect(webpage.processed.size).to.eql(processedSite)
    })

})

describe('processImagesObjects', () => {

    const dataFolder = 'data_test'
    const dataFolderPath = path.join(__dirname, '..', dataFolder)

    afterEach(() => {
        utils.rmdir(dataFolderPath)
    })

    const getImages = filename => {
        const website = path.join(__dirname, 'data', filename)
        const html = fs.readFileSync(website)
        return urls.getImagesFromPage(html)
    }

    it('should download menu images from website', async () => {
        const images = getImages('santori.com.ua-menyu.html')
        const homeUrl = 'http://santori.com.ua/'
        
        await urls.processImagesObjects(images, { homeUrl }, dataFolder)

        let files = []
        const expectedFiles = ['barmenu_521x365_8d3.jpg']

        if (fs.existsSync(dataFolderPath))
            files = fs.readdirSync(dataFolderPath)

        expect(files).to.eql(expectedFiles)
    })

})
