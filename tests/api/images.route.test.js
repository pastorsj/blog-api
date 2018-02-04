import request from 'supertest';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';

import app from '../../src/app';
import { SECRET } from '../../src/config/jwt.config';
import ImageService from '../../src/business/services/image.service';

const { expect } = chai;

chai.use(sinonChai);

describe('Test the /images route', () => {
    const token = jwt.sign({ id: 1 }, SECRET, { expiresIn: 3600 });
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });
    afterEach(() => {
        sandbox.restore();
    });
    describe('/gethash', () => {
        describe('GET', () => {
            it('should return the mocked hash', (done) => {
                const imageStub = sandbox.stub(ImageService, 'getImage').returns('1234567890');
                request(app)
                    .get('/api/images/gethash')
                    .set({ Authorization: `Bearer ${token}` })
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            expect(res.text).to.be.eq('1234567890');

                            sinon.assert.calledOnce(imageStub);
                            imageStub.restore();
                            done();
                        }
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
                    .set({ Authorization: `Bearer ${token}` })
                    .send({
                        src: 'http://imgur.com'
                    })
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            sinon.assert.calledWith(deleteImageStub, 'http://imgur.com');
                            deleteImageStub.restore();

                            const { data } = res.body;
                            expect(data).to.be.eq('Data');
                            done();
                        }
                    });
            });
            it('should call the delete image service and error out', (done) => {
                const deleteImageStub = sandbox.stub(ImageService, 'deleteImage')
                    .rejects();
                request(app)
                    .delete('/api/images/')
                    .set({ Authorization: `Bearer ${token}` })
                    .send({
                        src: 'http://imgur.com'
                    })
                    .expect(400)
                    .end((err) => {
                        if (err) {
                            done(err);
                        } else {
                            deleteImageStub.restore();
                            sinon.assert.calledWith(deleteImageStub, 'http://imgur.com');
                            done();
                        }
                    });
            });
        });
    });
});
