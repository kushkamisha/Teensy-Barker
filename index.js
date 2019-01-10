const { getUrl, processWebsite } = require('./lib/urls')

/**
 * Represents a website
 * @constructor
 */
function Website () {
    const url = getUrl()
    this.homeUrl = url.substr(-1) === '/' ? url.slice(0, -1) : url
    this.toProcess = new Set()
}

const website = new Website()
processWebsite(website)
