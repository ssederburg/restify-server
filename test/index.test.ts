import * as chai from 'chai'
const should = chai.should()
const expect = chai.expect;

chai.use(require('chai-as-promised'))

describe('index tests work', () => {
    it ('should say true', () => {
        return Promise.resolve(true)
    })
})
