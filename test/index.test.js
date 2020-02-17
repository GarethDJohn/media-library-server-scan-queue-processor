require('mocha');
const chai = require('chai');

const expect = chai.expect;

describe('a test', function() {
    it('passes', async function() {
        expect(1).to.equal(1);
    });
});
