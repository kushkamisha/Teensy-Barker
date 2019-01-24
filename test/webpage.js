/* eslint-disable no-undef */
'use strict'

const fs = require('fs')
const chai = require('chai')
const { rmDir } = require('../lib/utils')
// const chaiAsPromised = require('chai-as-promised')
const expect = chai.expect
const wpg = require('../lib/webpage')

// chai.use(chaiAsPromised)

describe('createWebpage', () => {
    
    it('should create a webpage object', () => {
        const _webpage = {
            url: 'http://www.orlypark.com.ua/menu',
            homeUrl: 'http://www.orlypark.com.ua/',
            toProcess: new Set(),
            processed: new Set(['one', 'two', 'three'])
        }

        const webpage = wpg.createWebpage(
            'http://www.orlypark.com.ua/menu',
            'http://www.orlypark.com.ua/',
            new Set(['one', 'two', 'three'])
        )

        expect(webpage).to.eql(_webpage)
    })

})

describe('createChildWebpages', () => {

    it('should create child webpages', () => {
        const webpage = {
            url: 'http://www.orlypark.com.ua/menu',
            homeUrl: 'http://www.orlypark.com.ua/',
            toProcess: new Set(['one', 'two']),
            processed: new Set(['three', 'four', 'five'])
        }

        const _pages = []
        
        _pages.push({
            url: 'one',
            homeUrl: 'http://www.orlypark.com.ua/',
            toProcess: new Set(),
            processed: new Set(['one', 'two', 'three', 'four', 'five'])
        })
        _pages.push({
            url: 'two',
            homeUrl: 'http://www.orlypark.com.ua/',
            toProcess: new Set(),
            processed: new Set(['one', 'two', 'three', 'four', 'five'])
        })

        const pages = wpg.createChildWebpages(webpage)

        expect(pages).to.eql(_pages)

    })

})

describe.skip('processWebpage', () => {

    const dataFolder = 'data_test'

    afterEach(() => {
        rmDir(__dirname + '/../' + dataFolder)
    })

    it('should process http://www.orlypark.com.ua/ correctly', function (done) {
        this.timeout(15000)

        const url = 'http://www.orlypark.com.ua/'
        const homeUrl = 'http://www.orlypark.com.ua/'
        const webpage = createWebpage(url, homeUrl, new Set())

        const dirContents = [
            'bar.pdf',
            'deserti.pdf',
            'detskoe-menyu.pdf',
            'kuhnya.pdf',
            'menu.pdf',
            'sushi.pdf'
        ]

        wpg.processWebpage(webpage, dataFolder)
            .then(() => {
                fs.readdir(__dirname + '/../' + dataFolder, (err, files) => {
                    if (err) throw err
                    expect(files).to.eql(dirContents)
                })
            }, err => {
                throw err
            })
            .finally(done)
    })
})
