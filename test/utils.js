/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
'use strict'

const fs = require('fs')
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
    const name = `${__dirname}/${now}`

    beforeEach(() => {
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

describe('getPdfNameFromUrl', () => {
    
    it('should generate correct name from \'https\'', () => {
        const folder = '/tmp'
        const url = 'https://github.com/'
        utils.getPdfNameFromUrl(url, folder).should.equal('/tmp/github.com.pdf')
    })

    it('should generate correct name with \'http\'', () => {
        const folder = '/tmp'
        const url = 'http://github.com/'
        utils.getPdfNameFromUrl(url, folder).should.equal('/tmp/github.com.pdf')
    })

    it('should generate correct name without slash at the end', () => {
        const folder = '/tmp'
        const url = 'https://github.com'
        utils.getPdfNameFromUrl(url, folder).should.equal('/tmp/github.com.pdf')
    })

})

describe('getNameFromUrl', () => {

    it('should generate correct name from \'https\'', () => {
        const url = 'https://github.com/'
        utils.getNameFromUrl(url).should.equal('github.com')
    })

    it('should generate correct name from \'http\'', () => {
        const url = 'http://github.com/'
        utils.getNameFromUrl(url).should.equal('github.com')
    })

    it('should generate correct name from \'www\'', () => {
        const url = 'https://www.github.com/'
        utils.getNameFromUrl(url).should.equal('github.com')
    })

    it('should generate correct name without slash at the end', () => {
        const url = 'https://github.com'
        utils.getNameFromUrl(url).should.equal('github.com')
    })

})

describe.only('getPdfNameFromUrl', () => {

    it('should generate correct name from \'https\'', () => {
        const folder = '/tmp'
        const url = 'https://github.com/'
        utils.getPdfNameFromUrl(url, folder).should.equal('/tmp/github.com.pdf')
    })

    it('should generate correct name with \'http\'', () => {
        const folder = '/tmp'
        const url = 'http://github.com/'
        utils.getPdfNameFromUrl(url, folder).should.equal('/tmp/github.com.pdf')
    })

    it('should generate correct name with \'www\'', () => {
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

// getFileTypeFromUrls
// saveFileFromUrl
// createPdfFromUrl
