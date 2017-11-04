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
            jwt = res.body.token;
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
                            return done(err);
                        }
                        addNewStub.restore();
                        sinon.assert.calledWith(addNewStub, 'tag', 'tags');
                        expect(res.body.data).to.be.eq('Data');
                        return done();
                    });
            });
            it('should call the addNew function and error out', (done) => {
                const addNewStub = sandbox.stub(RedisService, 'addNew')
                    .rejects();
                request(app)
                    .post('/api/tags/')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .expect(400)
                    .end((err) => {
                        if (err) {
                            return done(err);
                        }
                        addNewStub.restore();
                        return done();
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
                            return done(err);
                        }
                        getPrefixesStub.restore();
                        sinon.assert.calledWith(getPrefixesStub, 'tag', 50, 'tags');
                        expect(res.body.data).to.be.eq('Data');
                        return done();
                    });
            });
            it('should call the getPrefixes function and error out', (done) => {
                const getPrefixesStub = sandbox.stub(RedisService, 'getPrefixes')
                    .rejects();
                request(app)
                    .put('/api/tags/')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .expect(400)
                    .end((err) => {
                        if (err) {
                            return done(err);
                        }
                        getPrefixesStub.restore();
                        return done();
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
                            return done(err);
                        }
                        expect(res.body.data).to.deep.equal({
                            redis: 1,
                            databases: 1,
                            express: 1
                        });
                        return done();
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
                            return done(err);
                        }
                        expect(res.body.data.length).to.be.eq(1);
                        expect(res.body.data[0].author.username).to.be.eq('testuser');
                        expect(res.body.data[0].author.name).to.be.eq('Test User');
                        return done();
                    });
            });
        });
    });
});
