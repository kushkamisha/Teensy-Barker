/* eslint-disable quotes */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
'use strict'

const fs = require('fs')
const path = require('path')
const request = require('request')
const chai = require('chai')

const should = chai.should()
const { expect, assert } = chai
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

describe('mkdir', () => {

    const name = `${__dirname}/${Date.now()}`

    after(() => {
        fs.rmdirSync(name)
    })

    it('should create folder', async () => {
        await utils.mkdir(name)
        fs.existsSync(name).should.equal(true)
    })

    it('should do nothing if folder exists', async () => {
        const status = await utils.mkdir(name)
        status.should.equal('Folder already exists')
    })

})

describe('rmdir', () => {

    const now = Date.now()
    const name = `${__dirname}/temp-${now}`

    beforeEach(() => {
        if (!fs.existsSync(name))
            fs.mkdirSync(name)
    })

    it('should fails if trying to delete a file', done => {
        const filename = __dirname + '/1.html'
        fs.closeSync(fs.openSync(filename, 'w'))

        utils.rmdir(filename)
            .then(() => {
                done(new Error('Expected method to reject.'))
            })
            .catch(err => {
                err.should.equal('You are trying to delete a file')
                done()
            })
            .finally(() => {
                fs.unlinkSync(filename)
                fs.rmdirSync(name)
            })
    })

    it('should remove empty folder', async () => {
        await utils.rmdir(name)
        fs.existsSync(name).should.equal(false)
    })

    it('should remove folder with files', async () => {
        fs.closeSync(fs.openSync(`${name}/1.txt`, 'w'))
        fs.closeSync(fs.openSync(`${name}/2.js`, 'w'))
        fs.closeSync(fs.openSync(`${name}/3.html`, 'w'))

        await utils.rmdir(name)
        fs.existsSync(name).should.equal(false)
    })

    it('should remove folder with folders with files', async () => {
        fs.mkdirSync(`${name}/${now}.1`)
        fs.closeSync(fs.openSync(`${name}/${now}.1/1.txt`, 'w'))
        fs.closeSync(fs.openSync(`${name}/${now}.1/2.js`, 'w'))
        fs.closeSync(fs.openSync(`${name}/3.html`, 'w'))

        await utils.rmdir(name)
        fs.existsSync(name).should.equal(false)
    })

})

describe('getHomeUrlName', () => {

    it(`should get website name from it's home url`, () => {
        const url = 'https://www.google.com'
        utils.getHomeUrlName(url).should.equal('google.com')
    })

    it(`should get website name from url of any page of it`, () => {
        const url = 'https://github.com/marketplace/zenhub/plan/MDIyOk1hcmtl' +
            'dHBsYWNlTGlzdGluZ1BsYW42Mg==#pricing-and-setup'
        utils.getHomeUrlName(url).should.equal('github.com')
    })

})

describe('getNameFromUrl', () => {

    it(`should generate correct name from 'https'`, () => {
        const url = 'https://github.com/'
        utils.getNameFromUrl(url).should.equal('github.com')
    })

    it(`should generate correct name from 'http'`, () => {
        const url = 'http://github.com/'
        utils.getNameFromUrl(url).should.equal('github.com')
    })

    it(`should generate correct name from 'www'`, () => {
        const url = 'https://www.github.com/'
        utils.getNameFromUrl(url).should.equal('github.com')
    })

    it('should generate correct name without slash at the end', () => {
        const url = 'https://github.com'
        utils.getNameFromUrl(url).should.equal('github.com')
    })

    it('should remove extension of original files', () => {
        const url = 'https://www.google.com/index.html'
        utils.getNameFromUrl(url).should.equal('index')
    })

})

describe('getPdfNameFromUrl', () => {

    it(`should generate correct name from 'https'`, () => {
        const folder = '/tmp'
        const url = 'https://github.com/'
        utils.getPdfNameFromUrl(url, folder).should.equal('/tmp/github.com.pdf')
    })

    it(`should generate correct name with 'http'`, () => {
        const folder = '/tmp'
        const url = 'http://github.com/'
        utils.getPdfNameFromUrl(url, folder).should.equal('/tmp/github.com.pdf')
    })

    it(`should generate correct name with 'www'`, () => {
        const folder = '/tmp'
        const url = 'https://www.github.com/'
        utils.getPdfNameFromUrl(url, folder).should.equal('/tmp/github.com.pdf')
    })

    it('should generate correct name without slash at the end', () => {
        const folder = '/tmp'
        const url = 'https://github.com'
        utils.getPdfNameFromUrl(url, folder).should.equal('/tmp/github.com.pdf')
    })

})

describe('getFileTypeFromUrls', () => {

    it(`should return '.pdf' for type 'application/pdf'`, () => {
        utils.getFileTypeFromUrl('application/pdf').should.equal('.pdf')
    })
    it(`should return '.jpg' for type 'image/jpeg'`, () => {
        utils.getFileTypeFromUrl('image/jpeg').should.equal('.jpg')
    })
    it(`should return '.jpg' for type 'image/x-citrix-jpeg'`, () => {
        utils.getFileTypeFromUrl('image/x-citrix-jpeg').should.equal('.jpg')
    })

    it(`should return '.png' for type 'image/png'`, () => {
        utils.getFileTypeFromUrl('image/png').should.equal('.png')
    })
    it(`should return '.png' for type 'image/x-citrix-png'`, () => {
        utils.getFileTypeFromUrl('image/x-citrix-png').should.equal('.png')
    })
    it(`should return '.png' for type 'image/x-png'`, () => {
        utils.getFileTypeFromUrl('image/x-png').should.equal('.png')
    })

    it(`should return '.bmp' for type 'image/bmp'`, () => {
        utils.getFileTypeFromUrl('image/bmp').should.equal('.bmp')
    })
    it(`should return '.tiff' for type 'image/tiff'`, () => {
        utils.getFileTypeFromUrl('image/tiff').should.equal('.tiff')
    })
    it(`should return '.svg' for type 'image/svg+xml'`, () => {
        utils.getFileTypeFromUrl('image/svg+xml').should.equal('.svg')
    })

    it(`should return '.gif' for type 'image/gif'`, () => {
        utils.getFileTypeFromUrl('image/gif').should.equal('.gif')
    })
    it(`should return '.mdi' for type 'image/vnd.ms-modi'`, () => {
        utils.getFileTypeFromUrl('image/vnd.ms-modi').should.equal('.mdi')
    })
    it(`should return '.pjpeg' for type 'image/pjpeg'`, () => {
        utils.getFileTypeFromUrl('image/pjpeg').should.equal('.pjpeg')
    })

    it(`should return '.ico' for type 'image/x-icon'`, () => {
        utils.getFileTypeFromUrl('image/x-icon').should.equal('.ico')
    })

})

describe('saveFileFromResponse', () => {

    const now = Date.now()
    const dataFolder = `temp-${now}`
    const dataFolderPath = path.join(__dirname, '..', dataFolder)

    beforeEach(async () => {
        await utils.mkdir(dataFolderPath)
    })

    afterEach(async () => {
        await utils.rmdir(dataFolderPath)
    })

    const downloadFile = url => new Promise((resolve, reject) => {
        request(url)
            .on('error', err => {
                reject(err)
            })
            .on('response', res => {
                utils.saveFileFromResponse(res, dataFolder)
            })
            .on('complete', () => {
                resolve()
            })
    })

    it('should download file from url', async () => {
        const url = 'https://www.google.com/images/branding/googlelogo/2x/' +
                    'googlelogo_color_272x92dp.png'
        
        await downloadFile(url)

        let files = []
        const googleLogo = 'googlelogo_color_272x92dp.png'

        if (fs.existsSync(dataFolderPath))
            files = fs.readdirSync(dataFolderPath)

        expect(files).to.include(googleLogo)
    })

    it('should download file if using redirection', async () => {
        const url = 'https://goo.gl/nHkNBN'

        await downloadFile(url)

        let files = []
        const googleLogo = 'googlelogo_color_272x92dp.png'

        if (fs.existsSync(dataFolderPath))
            files = fs.readdirSync(dataFolderPath)

        expect(files).to.include(googleLogo)
    })

})

describe('createPdfFromUrl', () => {

    const now = Date.now()
    const dataFolder = `temp-${now}`
    const dataFolderPath = path.join(__dirname, '..', dataFolder)

    afterEach(async () => {
        await utils.rmdir(dataFolderPath)
    })

    it('should create pdf from url', async function() {
        this.timeout(15000)

        const url = 'https://www.google.com/'
        await utils.createPdfFromUrl({ url }, dataFolder)

        if (fs.existsSync(dataFolderPath)) {
            const pdfName = 'google.com.pdf'
            const pdfPath = path.join(dataFolderPath, pdfName)
            const fileSize = 32589 // size of file in bytes

            const files = fs.readdirSync(dataFolderPath)
            const { size } = fs.lstatSync(pdfPath)

            expect(files).to.include(pdfName)
            expect(size).to.equal(fileSize)
        } else {
            throw new Error(`Can't find folder`)
        }
    })

    it('should deal with redirection', async function() {
        this.timeout(15000)

        const url = 'https://goo.gl/JR9BD8'
        await utils.createPdfFromUrl({ url }, dataFolder)

        if (fs.existsSync(dataFolderPath)) {
            const pdfName = 'JR9BD8.pdf'
            const pdfPath = path.join(dataFolderPath, pdfName)
            const fileSize = 32589 // size of file in bytes

            const files = fs.readdirSync(dataFolderPath)
            const { size } = fs.lstatSync(pdfPath)

            expect(files).to.include(pdfName)
            expect(size).to.equal(fileSize)
        } else {
            throw new Error(`Can't find folder`)
        }
    })

})

describe('urlToEncodedUri', () => {

    it('should replace non-english chars in the url', () => {
        const url = 'http://кто.рф'
        utils.urlToEncodedUri(url)
            .should.equal('http://%D0%BA%D1%82%D0%BE.%D1%80%D1%84')
    })

    it('should replace non-english chars in the url', () => {
        const url = 'http://кто.рф/ad.php?v=ch#reg'
        utils.urlToEncodedUri(url).should
            .equal('http://%D0%BA%D1%82%D0%BE.%D1%80%D1%84/ad.php?v=ch#reg')
    })

    it('should replace all non-english chars in the entire url', () => {
        const url = 'http://школьнаяматематика.рф/upload/Концепция развития' +
            ' математического образования в РФ.pdf'
        const encoded = 'http://%D1%88%D0%BA%D0%BE%D0%BB%D1%8C%D0%BD%D0%B0%D1' +
            '%8F%D0%BC%D0%B0%D1%82%D0%B5%D0%BC%D0%B0%D1%82%D0%B8%D0%BA%D0%B0.' +
            '%D1%80%D1%84/upload/%D0%9A%D0%BE%D0%BD%D1%86%D0%B5%D0%BF%D1%86%' +
            'D0%B8%D1%8F%20%D1%80%D0%B0%D0%B7%D0%B2%D0%B8%D1%82%D0%B8%D1%8F%' +
            '20%D0%BC%D0%B0%D1%82%D0%B5%D0%BC%D0%B0%D1%82%D0%B8%D1%87%D0%B5%' +
            'D1%81%D0%BA%D0%BE%D0%B3%D0%BE%20%D0%BE%D0%B1%D1%80%D0%B0%D0%B7%' +
            'D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F%20%D0%B2%20%D0%A0%D0%A4.pdf'
        utils.urlToEncodedUri(url)
            .should.equal(encoded)
    })

    it('should left "as if" url with only english letters', () => {
        const url = 'https://gist.github.com/zenwalker/b1c83611090bb446e44b7a' +
            '2d0bcd5729'
        utils.urlToEncodedUri(url).should.equal(url)
    })

})

describe('getUrlScheme', () => {

    it('should get "http" scheme (homepage url)', () => {
        const url = 'http://fossilinsects.myspecies.info'
        utils.getUrlScheme(url).should.equal('http')
    })

    it('should get "http" scheme (child page url)', () => {
        const url = 'http://fossilinsects.myspecies.info/node/5#membership'
        utils.getUrlScheme(url).should.equal('http')
    })

    it('should get "https" scheme (homepage url)', () => {
        const url = 'https://www.google.com'
        utils.getUrlScheme(url).should.equal('https')
    })

    it('should get "https" scheme (child page url)', () => {
        const url = 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' +
            '/Reference/Global_Objects/encodeURIComponent'
        utils.getUrlScheme(url).should.equal('https')
    })

    it('should use default "http" if url has no scheme', () => {
        const url = 'google.com'
        utils.getUrlScheme(url).should.equal('http')
    })

})

describe('downloadImage', () => {

    const now = Date.now()
    const dataFolder = `temp-${now}`
    const dataFolderPath = path.join(__dirname, '..', dataFolder)

    beforeEach(async () => {
        await utils.mkdir(dataFolderPath)
    })

    afterEach(async () => {
        await utils.rmdir(dataFolderPath)
    })

    it('should download image from url', async () => {
        const url = 'https://www.google.com/images/branding/googlelogo/2x/' +
                    'googlelogo_color_272x92dp.png'
        await utils.downloadImage(url, dataFolder)

        let files = []
        const googleImage = 'googlelogo_color_272x92dp.png'

        if (fs.existsSync(dataFolderPath))
            files = fs.readdirSync(dataFolderPath)

        expect(files).to.eql([googleImage])
    })

    it('should download image from redirection url', async () => {
        const url = 'https://goo.gl/hdVS4V'
        await utils.downloadImage(url, dataFolder)

        let files = []
        const googleImage = 'googlelogo_color_272x92dp.png'

        if (fs.existsSync(dataFolderPath))
            files = fs.readdirSync(dataFolderPath)

        expect(files).to.eql([googleImage])
    })

})
