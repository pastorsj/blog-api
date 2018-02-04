import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';

import GistService from '../../src/business/services/gist.service';

chai.use(sinonChai);
const { expect } = chai;

describe('Test the Gist Service', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });
    afterEach(() => {
        sandbox.restore();
    });
    describe('gistify', () => {
        it('should make a call to the gistify library', (done) => {
            GistService.convert('https://github.com/pastorsj/blog-api/blob/master/src/server.js').then((result) => {
                expect(result).to.have.keys('html', 'file', 'styles');
                done();
            }).catch((err) => {
                done(err);
            });
        });
    });
});
