/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
'use strict'

const should = require('chai').should()

const utils = require('../lib/utils')

describe.skip('isEmptyArray', () => {

    it('should act normal with non array param', () => {
        const obj = { name: 'John' }
        const num = 5
        const str = 'John'

        utils.isEmptyArray(obj).should.equal(false)
        utils.isEmptyArray(num).should.equal(false)
        utils.isEmptyArray(str).should.equal(false)
    })

    it('should return true if array is empty', () => {
        const arr = []
        utils.isEmptyArray(arr).should.equal(true)
    })

    it('should return false if array is not empty', () => {
        const arr = [1, 2, 3]
        utils.isEmptyArray(arr).should.equal(false)
    })

})

describe('getUrl', () => {

    let args = []

    before(() => {
        args = [...process.argv] // deep copy of array
    })

    afterEach(() => {
        process.argv = [...args]
    })

    it('should use default url when it\'s not provided', () => {
        utils.getUrl().should.equal('http://santori.com.ua/')
    })

    it('should use provided url', () => {
        process.argv.push('-url')
        process.argv.push('http://orlypark.com.ua/')
        utils.getUrl().should.equal('http://orlypark.com.ua/')
    })

    it('should append slash to the end of url when nesessary', () => {
        process.argv.push('-url')
        process.argv.push('http://orlypark.com.ua')
        utils.getUrl().should.equal('http://orlypark.com.ua/')
    })

    it('should', () => {
        process.argv.push('-url')
        process.argv.push('olala')
        utils.getUrl().should.equal('http://orlypark.com.ua')
    })

})

// isValidUrl
/**
 * https://www.google.com
http://www.google.com
www.google.com
h-ello.y.ou
htt://www.google.com
://www.google.com
 */

// prettifyUrl

describe.skip('isMenuUrl', () => {

    it('should return false for empty url', () => {
        const url = ''
        const homeUrl = ''
        utils.isMenuUrl(url, homeUrl).should.equal(false)
    })

    it('should return false if url is for another website', () => {
        const url = 'http://orlypark.com.ua/menu/'
        const homeUrl = 'http://www.puzatahata.ua/'
        utils.isMenuUrl(url, homeUrl).should.equal(false)
    })

    it('should return true if url is to the menu file or webpage', () => {
        const url = 'http://orlypark.com.ua/menu/'
        const homeUrl = 'http://orlypark.com.ua/'
        utils.isMenuUrl(url, homeUrl).should.equal(true) 
    })
})

describe.skip('formatUrl', () => {

    it('should add slash to the url without it', () => {
        const _url = 'http://orypark.com.ua'
        const url = 'http://orypark.com.ua/'
        utils.formatUrl(_url).should.equal(url)
    })

    it('should keep slash in the url with it', () => {
        const _url = 'http://orypark.com.ua/'
        const url = 'http://orypark.com.ua/'
        utils.formatUrl(_url).should.equal(url)
    })

})