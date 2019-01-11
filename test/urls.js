/* eslint-disable no-undef */
'use strict'

const expect = require('chai').expect
const { Website, processWebsite } = require('../lib/urls')

describe('processWebsite', () => {

    let website = {}

    beforeEach(() => {
        const url = 'http://orlypark.com.ua/'
        const homeUrl = 'http://orlypark.com.ua/'
        website = new Website(url, homeUrl)
    })

    it('should process http://orlypark.com.ua/ correctly', async () => {
        const _website = {
            currentUrl: 'http://orlypark.com.ua/',
            homeUrl: 'http://orlypark.com.ua/',
            toProcess:  new Set([
                'http://orlypark.com.ua//menu/',
                'http://orlypark.com.ua//menu/kuhnya/',
                'http://orlypark.com.ua//menu/detskoe-menyu/',
                'http://orlypark.com.ua//menu/sushi/',
                'http://orlypark.com.ua//menu/deserti/',
                'http://orlypark.com.ua//menu/bar/'
            ])
        }

        await processWebsite(website)

        expect(website).to.eql(_website)
    })
})
