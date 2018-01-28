import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';

import RedisService from '../../src/services/redis.service';

const { expect } = chai;
const SET_NAME = 'TEST_TAGS';

chai.use(sinonChai);

describe('Test the Redis service', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });
    afterEach(() => {
        sandbox.restore();
    });
    describe('addNew', () => {
        it('should call the RedisService.addNew function and return successfully', (done) => {
            RedisService.addNew('quality', SET_NAME).then((res) => {
                expect(res).to.be.eq('');
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('should call the RedisService.addNew function and error out', (done) => {
            RedisService.addNew(null, SET_NAME).then((res) => {
                done(res);
            }).catch((err) => {
                expect(err.message).to.be.a('string');
                done();
            });
        });
    });
    describe('getPrefixes', () => {
        before((done) => {
            RedisService.addNew('quality', SET_NAME)
                .then(() => RedisService.addNew('qualification', SET_NAME))
                .then(() => {
                    done();
                }).catch((err) => {
                    done(err);
                });
        });
        it('should return successfully', (done) => {
            RedisService.getPrefixes('qual', 50, SET_NAME).then((res) => {
                expect(res).to.deep.equal(['qualification', 'quality']);
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('should error out since the prefix was not provided', (done) => {
            RedisService.getPrefixes(null, 50, SET_NAME).then((res) => {
                done(res);
            }).catch((err) => {
                expect(err.message).to.be.a('string');
                done();
            });
        });
        it('should error out since the count was not provided', (done) => {
            RedisService.getPrefixes('null', null, SET_NAME).then((res) => {
                done(res);
            }).catch((err) => {
                expect(err.message).to.be.a('string');
                done();
            });
        });
        it('should return successully when the entire word is provided', (done) => {
            RedisService.getPrefixes('quality', 50, SET_NAME).then((res) => {
                expect(res).to.deep.equal(['quality']);
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('should return no results when the prefix does not exist', (done) => {
            RedisService.getPrefixes('dne', 50, SET_NAME).then((res) => {
                expect(res).to.deep.equal([]);
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('should return successfully when a longer version of a word exists', (done) => {
            RedisService.getPrefixes('qualif', 50, SET_NAME).then((res) => {
                expect(res).to.deep.equal(['qualification']);
                done();
            }).catch((err) => {
                done(err);
            });
        });
    });
});
