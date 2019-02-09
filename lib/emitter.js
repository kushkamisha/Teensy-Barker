'use strict'

const events = require('events')

class MyEmitter extends events.EventEmitter {

    constructor(limit) {
        super()
        this.processNum = 0
        this.limit = limit
    }

    getLimit() {
        return this.limit
    }

    getProcessesNum() {
        return this.processNum
    }

}

const myEmitter = new MyEmitter(100)

myEmitter.on('add process', function() {
    this.processNum += 1
    console.log(`Number of processes: ${this.processNum}`)
})

myEmitter.on('end process', function() {
    console.log(`Number of processes: ${this.processNum}`)
    this.processNum -= 1
})

// myEmitter.emit('new process')
// myEmitter.emit('new process')
// myEmitter.emit('new process')
// myEmitter.emit('new process')
// myEmitter.emit('end process')

// myEmitter.getProcessesNum()

module.exports = myEmitter
