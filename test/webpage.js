/* eslint-disable no-undef */
'use strict'

const fs = require('fs')
const path = require('path')
const chai = require('chai')

const { getNameFromUrl, mkdir, rmdir } = require('../lib/utils')
const expect = chai.expect
const {
    createWebpage,
    createChildWebpages,
    processWebpage
} = require('../lib/webpage')

describe('createWebpage', () => {
    
    it('should create a webpage object', () => {
        const _webpage = {
            url: 'http://www.orlypark.com.ua/menu',
            homeUrl: 'http://www.orlypark.com.ua/',
            toProcess: new Set(),
            processed: new Set(['one', 'two', 'three'])
        }

        const webpage = createWebpage(
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

        const pages = createChildWebpages(webpage)

        expect(pages).to.eql(_pages)

    })

})

describe('processWebpage', () => {

    const now = Date.now()
    const dataFolder = `temp-${now}`
    const dataFolderPath = path.join(__dirname, '..', dataFolder)

    before(async () => {
        await mkdir(dataFolderPath)
    })

    after(async () => {
        await rmdir(dataFolderPath)
    })

    const process = (url, dirContents, done) => {

        const homeUrl = url
        const webpage = createWebpage(url, homeUrl, new Set())
        const siteFolder = path.join(dataFolder, getNameFromUrl(homeUrl))

        processWebpage(webpage, siteFolder)
            .then(() => {
                fs.readdir(__dirname + '/../' + siteFolder, (err, files) => {
                    if (err) throw err
                    expect(files).to.eql(dirContents)
                })
            }, err => {
                throw err
            })
            .finally(done)
    }

    it('should process http://orlypark.com.ua/ correct', function (done) {
        this.timeout(15000)
        const dirContents = [
            'bar.pdf',
            'deserti.pdf',
            'detskoe-menyu.pdf',
            'kuhnya.pdf',
            'menu.pdf',
            'menuItemLeft.png',
            'menuItemRight.png',
            'sushi.pdf'
        ]
        process('http://orlypark.com.ua/', dirContents, done)
    })

    it('should process http://santori.com.ua/ correct', function (done) {
        this.timeout(15000)
        const dirContents = [
            'Bar.pdf',
            'Coctails.pdf',
            'Sets%20A3_04.jpg',
            'VineBar.pdf',
            'bar002_521x365_8d3.jpg',
            'barmenu_521x365_8d3.jpg',
            'coctail001_521x365_8d3.jpg',
            'menyu-bara.pdf',
            'menyu.pdf',
            'wine_521x365_8d3.jpg'
        ]
        process('http://santori.com.ua/', dirContents, done)
    })

})
