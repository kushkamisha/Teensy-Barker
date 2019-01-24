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

// createFolder
// rmDir
// getPdfNameFromUrl
// getFileTypeFromUrls
// saveFileFromUrl
// createPdfFromUrl
