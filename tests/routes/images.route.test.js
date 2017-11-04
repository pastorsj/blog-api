import request from 'supertest';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';

import app from '../../src/app';
import acquireJwt from '../common/jwt.common';
import ImageService from '../../src/services/image.service';

const { expect } = chai;

chai.use(sinonChai);

describe('Test the /images route', () => {
    let jwt = '';
    let sandbox;

    beforeEach((done) => {
        sandbox = sinon.sandbox.create();
        acquireJwt(app).then((res) => {
            jwt = res.body.token;
            done();
        }).catch((err) => {
            done(err);
        });
    });
    afterEach(() => {
        sandbox.restore();
    });
    describe('/gethash', () => {
        describe('GET', () => {
            it('should return the mocked hash', (done) => {
                sandbox.stub(ImageService, 'getImage').returns('1234567890');
                request(app)
                    .get('/api/images/gethash')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        expect(res.text).to.be.eq('1234567890');
                        return done();
                    });
            });
        });
    });
    describe('/', () => {
        describe('DELETE', () => {
            it('should successfully call the delete image service', (done) => {
                const deleteImageStub = sandbox.stub(ImageService, 'deleteImage')
                    .resolves({ status: 200, data: 'Data' });
                request(app)
                    .delete('/api/images/')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .send({
                        src: 'http://imgur.com'
                    })
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        deleteImageStub.restore();
                        sinon.assert.calledWith(deleteImageStub, 'http://imgur.com');

                        const { data } = res.body;
                        expect(data).to.be.eq('Data');
                        return done();
                    });
            });
            it('should call the delete image service and error out', (done) => {
                const deleteImageStub = sandbox.stub(ImageService, 'deleteImage')
                    .rejects();
                request(app)
                    .delete('/api/images/')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .send({
                        src: 'http://imgur.com'
                    })
                    .expect(400)
                    .end((err) => {
                        if (err) {
                            return done(err);
                        }
                        deleteImageStub.restore();
                        sinon.assert.calledWith(deleteImageStub, 'http://imgur.com');
                        return done();
                    });
            });
        });
    });
});
