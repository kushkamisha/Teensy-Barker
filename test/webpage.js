/* eslint-disable no-undef */
'use strict'

const expect = require('chai').expect
const { createWebpage, processWebpage } = require('../lib/webpage')

describe('processWebpage', () => {

    let webpage = {}

    beforeEach(() => {
        const url = 'http://www.orlypark.com.ua/'
        const homeUrl = 'http://www.orlypark.com.ua/'
        webpage = createWebpage(url, homeUrl, new Set())
    })

    it('should process http://www.orlypark.com.ua/ correctly', async () => {
        await processWebpage(webpage)
        // expect(1).to.eql(1 + 0)
        // expect(webpage).to.eql(_webpage)
    })
})
