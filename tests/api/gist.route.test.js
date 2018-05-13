import request from 'supertest';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';

import app from '../../src/app';
import { SECRET } from '../../src/config/jwt.config';
import GistService from '../../src/business/services/gist.service';

const { expect } = chai;
chai.use(sinonChai);

describe('Test the /gist route', () => {
    const token = jwt.sign({ id: 1 }, SECRET, { expiresIn: 3600 });
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });
    describe('/', () => {
        describe('POST', () => {
            it('should return successfully', (done) => {
                const gistStub = sandbox.stub(GistService, 'convert').resolves({
                    file: '',
                    styles: '',
                    html: ''
                });
                request(app)
                    .post('/api/gist')
                    .set({ Authorization: `Bearer ${token}` })
                    .send({
                        link: 'https://github.com/pastorsj/blog-api/blob/master/tests/routes/gist.route.test.js'
                    })
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            const { data } = res.body;
                            expect(data).to.have.all.keys('file', 'styles', 'html');

                            sinon.assert.calledWith(gistStub, 'https://github.com/pastorsj/blog-api/blob/master/tests/routes/gist.route.test.js');
                            gistStub.restore();
                            done();
                        }
                    });
            });
            it('should error out when conversion fails', (done) => {
                sandbox.stub(GistService, 'convert').rejects();
                request(app)
                    .post('/api/gist')
                    .set({ Authorization: `Bearer ${token}` })
                    .send({
                        link: 'https://github.com/pastorsj/blog-api/blob/master/tests/routes/gist.route.test.js'
                    })
                    .expect(400, done);
            });
            it('should error out when no link is provided', (done) => {
                request(app)
                    .post('/api/gist')
                    .set({ Authorization: `Bearer ${token}` })
                    .expect(400, done);
            });
        });
    });
});
