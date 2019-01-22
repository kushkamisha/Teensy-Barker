'use strict'

const phantom = require('phantom')

class Html2Pdf {

    constructor(url, filename) {
        this.url = url
        this.filename = filename
        this.instance = null
    }

    createPage() {
        return new Promise((resolve, reject) => {
            phantom.create()
                .then(instance => {
                    this.instance = instance
                    resolve(instance.createPage())
                })
                .catch(err => reject(err))
        })
    }

    createPdf(page) {
        return new Promise((resolve, reject) => {
            page.open(this.url)
                .then(ostatus => {
                    if (ostatus === 'fail') {
                        reject('Can not open the url')
                        return
                    }

                    page.render(this.filename)
                        .then(rstatus => {
                            if (rstatus)
                                resolve()

                        })
                        .catch(err => {
                            reject('createPdf error')
                        })
                })
        })
    }

    processUrl(url) {
        return new Promise((resolve, reject) => {
            this.createPage(this.url)
                .then(page => {
                    this.createPdf(page)
                        .then(() => {
                            resolve('createPdf succeeded')
                        })
                        .catch(err => {
                            reject(err)
                        })
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    cleanUp() {
        this.instance.exit()
    }

}

module.exports = Html2Pdf
