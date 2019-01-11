/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
'use strict'

const should = require('chai').should()

const utils = require('../lib/utils')

describe('isEmptyArray', () => {

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

// getUrl

describe('isMenuUrl', () => {

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

describe('formatUrl', () => {

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