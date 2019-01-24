/* eslint-disable no-undef */
'use strict'

const fs = require('fs')
const chai = require('chai')
const { rmDir } = require('../lib/utils')
// const chaiAsPromised = require('chai-as-promised')
const expect = chai.expect
const { createWebpage, processWebpage } = require('../lib/webpage')

// chai.use(chaiAsPromised)

describe('processWebpage', () => {

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

        processWebpage(webpage, dataFolder)
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
