/* eslint-disable no-undef */
'use strict'

const expect = require('chai').expect
const { createWebpage, processWebpage } = require('../lib/urls')

describe('processwebpage', () => {

    let webpage = {}

    beforeEach(() => {
        const url = 'http://orlypark.com.ua/'
        const homeUrl = 'http://orlypark.com.ua/'
        webpage = createWebpage(url, homeUrl, new Set())
    })

    it('should process http://orlypark.com.ua/ correctly', async () => {
        const _webpage = {
            currentUrl: 'http://orlypark.com.ua/',
            homeUrl: 'http://orlypark.com.ua/',
            toProcess: new Set([
                'http://orlypark.com.ua/menu/',
                'http://orlypark.com.ua/menu/kuhnya/',
                'http://orlypark.com.ua/menu/detskoe-menyu/',
                'http://orlypark.com.ua/menu/sushi/',
                'http://orlypark.com.ua/menu/deserti/',
                'http://orlypark.com.ua/menu/bar/'
            ]),
            processed: new Set([
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
                'http://orlypark.com.ua/stocks/biznes-vremya-v-orly-park.html',
                'http://orlypark.com.ua/stocks/spetsialnoe-predlozhenie-dlya-provedeniya-svadeb.html',
                'https://www.facebook.com/orlypark',
                'https://twitter.com/orly_park',
                'http://vk.com/orlypark'
            ])
        }

        await processWebpage(webpage)

        expect(webpage).to.eql(_webpage)
    })
})
