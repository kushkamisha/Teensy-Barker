/* eslint-disable no-undef */
'use strict'

const chai = require('chai')
// eslint-disable-next-line no-unused-vars
const should = chai.should()
const expect = chai.expect

const urls = require('../lib/urls')

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

// getUrlsFromChunk

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

// getHref

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
