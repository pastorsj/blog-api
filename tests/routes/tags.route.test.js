import request from 'supertest';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';

import app from '../../src/app';
import acquireJwt from '../common/jwt.common';
import { setupArticlesCollection, destroyArticlesCollection, createCounter } from '../mocks/article.mock';
import { setupUserCollection } from '../mocks/user.mock';
import RedisService from '../../src/services/redis.service';

const { expect } = chai;

chai.use(sinonChai);

describe('Test the /tags route', () => {
    let jwt = '';
    let sandbox;

    beforeEach((done) => {
        sandbox = sinon.sandbox.create();
        acquireJwt(app).then((res) => {
            jwt = res.body.access_token;
            done();
        }).catch((err) => {
            done(err);
        });
    });
    afterEach(() => {
        sandbox.restore();
    });
    describe('/', () => {
        describe('POST', () => {
            it('should call the addNew function and return successfully', (done) => {
                const addNewStub = sandbox.stub(RedisService, 'addNew')
                    .resolves({ status: 200, data: 'Data' });
                request(app)
                    .post('/api/tags/')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .send({
                        tag: 'tag'
                    })
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            addNewStub.restore();
                            sinon.assert.calledWith(addNewStub, 'tag', 'tags');

                            const { data } = res.body;
                            expect(data).to.be.eq('Data');
                            done();
                        }
                    });
            });
            it('should call the addNew function and error out', (done) => {
                sandbox.stub(RedisService, 'addNew').rejects();
                request(app)
                    .post('/api/tags/')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .expect(400)
                    .end((err) => {
                        if (err) {
                            done(err);
                        } else {
                            done();
                        }
                    });
            });
        });
        describe('PUT', () => {
            it('should call the getPrefixes function and return successfully', (done) => {
                const getPrefixesStub = sandbox.stub(RedisService, 'getPrefixes')
                    .resolves({ status: 200, data: 'Data' });
                request(app)
                    .put('/api/tags/')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .send({
                        prefix: 'tag',
                        count: 50
                    })
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            getPrefixesStub.restore();
                            sinon.assert.calledWith(getPrefixesStub, 'tag', 50, 'tags');
    
                            const { data } = res.body;
                            expect(data).to.be.eq('Data');
                            done();
                        }
                    });
            });
            it('should call the getPrefixes function and error out', (done) => {
                sandbox.stub(RedisService, 'getPrefixes').rejects();
                request(app)
                    .put('/api/tags/')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .expect(400)
                    .end((err) => {
                        if (err) {
                            done(err);
                        } else {
                            done();
                        }
                    });
            });
        });
        describe('GET', () => {
            beforeEach((done) => {
                createCounter().then(() => setupArticlesCollection()).then(() => {
                    done();
                }).catch((err) => {
                    done(err);
                });
            });
            afterEach((done) => {
                destroyArticlesCollection().then(() => {
                    done();
                }).catch((err) => {
                    done(err);
                });
            });
            it('should call the getTagsByPopularity function and return successfully', (done) => {
                request(app)
                    .get('/api/tags/')
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            const { data } = res.body;
                            expect(data).to.deep.equal({
                                redis: 1,
                                databases: 1,
                                express: 1
                            });
                            done();
                        }
                    });
            });
        });
    });
    describe('/:tag', () => {
        describe('GET', () => {
            beforeEach((done) => {
                createCounter()
                    .then(() => setupUserCollection()
                        .then(() => setupArticlesCollection()
                            .then(() => {
                                done();
                            }))).catch((err) => {
                        done(err);
                    });
            });
            afterEach((done) => {
                destroyArticlesCollection().then(() => {
                    done();
                }).catch((err) => {
                    done(err);
                });
            });
            it('should call the getArticlesByTag function and return successfully', (done) => {
                request(app)
                    .get('/api/tags/redis')
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            const { data } = res.body;
                            expect(data.length).to.be.eq(1);
                            expect(data[0].author.username).to.be.eq('testuser');
                            expect(data[0].author.name).to.be.eq('Test User');
                            done();
                        }
                    });
            });
        });
    });
});
