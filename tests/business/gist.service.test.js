import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import converter from 'node-gist-html';

import GistService from '../../src/business/services/gist.service';

chai.use(sinonChai);
const { expect } = chai;

describe('Test the Gist Service', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });
    describe('gistify', () => {
        it('should make a call to the gistify library', (done) => {
            sandbox.stub(converter, 'gistify').resolves({ html: '', file: '', styles: '' });
            GistService.convert('https://github.com').then((result) => {
                expect(result).to.have.keys('html', 'file', 'styles');
                done();
            }).catch((err) => {
                done(err);
            });
        });
    });
});
