import request from 'supertest';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';

import app from '../../src/app';
import RedisService from '../../src/business/services/redis.service';
import { SECRET } from '../../src/config/jwt.config';
import TagService from '../../src/business/services/tags.service';

const { expect } = chai;

chai.use(sinonChai);

describe('Test the /tags route', () => {
    const token = jwt.sign({ id: 1 }, SECRET, { expiresIn: 3600 });
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });
    afterEach(() => {
        sandbox.restore();
    });
    describe('/', () => {
        describe('POST', () => {
            it('should call the addNew function and return successfully', (done) => {
                const addNewStub = sandbox.stub(RedisService, 'addNew').resolves('');
                request(app)
                    .post('/api/tags/')
                    .set({ Authorization: `Bearer ${token}` })
                    .send({
                        tag: 'tag'
                    })
                    .expect(204)
                    .end((err) => {
                        if (err) {
                            done(err);
                        } else {
                            sinon.assert.calledWith(addNewStub, 'tag', 'tags');
                            addNewStub.restore();
                            done();
                        }
                    });
            });
            it('should call the addNew function and error out', (done) => {
                sandbox.stub(RedisService, 'addNew').rejects();
                request(app)
                    .post('/api/tags/')
                    .set({ Authorization: `Bearer ${token}` })
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
                const getPrefixesStub = sandbox.stub(RedisService, 'getPrefixes').resolves('Data');
                request(app)
                    .put('/api/tags/')
                    .set({ Authorization: `Bearer ${token}` })
                    .send({
                        prefix: 'tag',
                        count: 50
                    })
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            sinon.assert.calledWith(getPrefixesStub, 'tag', 50, 'tags');
                            getPrefixesStub.restore();
    
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
                    .set({ Authorization: `Bearer ${token}` })
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
            it('should call the getTagsByPopularity function and return successfully', (done) => {
                const getTagsByPopularityStub = sandbox.stub(TagService, 'getTagsByPopularity').resolves({
                    redis: 1,
                    databases: 1,
                    express: 1
                });
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

                            sinon.assert.calledOnce(getTagsByPopularityStub);
                            getTagsByPopularityStub.restore();
                            done();
                        }
                    });
            });
            it('should call the getTagsByPopularity function but error out', (done) => {
                sandbox.stub(TagService, 'getTagsByPopularity').rejects();
                request(app)
                    .get('/api/tags/')
                    .expect(404, done);
            });
        });
    });
    describe('/:tag', () => {
        describe('GET', () => {
            it('should call the getArticlesByTag function and return successfully', (done) => {
                const getArticlesByTagStub = sandbox.stub(TagService, 'getArticlesByTag').resolves([
                    {
                        title: 'Title 1',
                        text: '<p>New Article</p>',
                        author: {
                            username: 'testuser',
                            name: 'Test User'
                        },
                        tags: ['redis', 'express', 'databases']
                    }
                ]);
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
                            expect(data[0].title).to.be.eq('Title 1');

                            sinon.assert.calledWith(getArticlesByTagStub, 'redis');
                            getArticlesByTagStub.restore();
                            done();
                        }
                    });
            });
            it('should call the getArticlesByTag function and return successfully', (done) => {
                sandbox.stub(TagService, 'getArticlesByTag').rejects();
                request(app)
                    .get('/api/tags/redis')
                    .expect(404, done);
            });
        });
    });
});
