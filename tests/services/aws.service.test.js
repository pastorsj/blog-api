import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import { S3 } from '../../src/config/aws.config';

import AWSService from '../../src/services/aws.service';

const { expect } = chai;

chai.use(sinonChai);

describe('Test the AWS service', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });
    afterEach(() => {
        sandbox.restore();
    });
    describe('deleteImage', () => {
        it('should call S3.deleteObjects successfully', (done) => {
            sandbox.stub(S3, 'deleteObjects').callsFake((params, cb) => {
                cb(null, 'Data');
            });
            AWSService.deleteImage('https://flickr.com').then((res) => {
                expect(res.status).to.be.eq(204);
                expect(res.data).to.be.eq('Data');
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('should call S3.deleteObjects and error out', (done) => {
            sandbox.stub(S3, 'deleteObjects').callsFake((params, cb) => {
                cb('Error', null);
            });
            AWSService.deleteImage('https://flickr.com').then((res) => {
                done(res);
            }).catch((err) => {
                expect(err.message).to.be.eq('Error when deleting image: Error');
                done();
            });
        });
        it('should call S3.deleteObjects and catch the error thrown', (done) => {
            sandbox.stub(S3, 'deleteObjects').throws(new Error('Disconnected'));
            AWSService.deleteImage('https://flickr.com').then((res) => {
                done(res);
            }).catch((err) => {
                expect(err.message).to.be.a('string');
                done();
            });
        });
    });
    describe('postImage', () => {
        it('should call S3.putObject successfully', (done) => {
            sandbox.stub(S3, 'putObject').callsFake((params, cb) => {
                cb(null, 'Data');
            });
            AWSService.postImage('key', 'file', 'image/png').then((res) => {
                expect(res.url).to.be.eq('https://s3.amazonaws.com/lighthouseblogimg/key');
                expect(res.data).to.be.eq('Data');
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('should call S3.putObject and error out', (done) => {
            sandbox.stub(S3, 'putObject').callsFake((params, cb) => {
                cb('Error', null);
            });
            AWSService.postImage('key', 'file', 'image/png').then((res) => {
                done(res);
            }).catch((err) => {
                expect(err.message).to.be.eq('Error when posting image: Error');
                done();
            });
        });
        it('should call S3.putObject and catch the error thrown', (done) => {
            sandbox.stub(S3, 'putObject').throws(new Error('Disconnected'));
            AWSService.postImage('key', 'file', 'image/png').then((res) => {
                done(res);
            }).catch((err) => {
                expect(err.message).to.be.a('string');
                done();
            });
        });
    });
});
