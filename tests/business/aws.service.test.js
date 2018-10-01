import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import gm from 'gm';

import { S3 } from '../../src/config/aws.config';
import AWSService from '../../src/business/services/aws.service';

const { expect } = chai;
chai.use(sinonChai);

describe('Test the AWS service', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });
    describe('deleteImage', () => {
        it('should call S3.deleteObjects successfully', (done) => {
            const deleteObjectsStub = sandbox.stub(S3, 'deleteObjects').callsFake((params, cb) => {
                cb(null, 'Data');
            });
            AWSService.deleteImage('https://flickr.com/pictures/testpicture.jpg').then((res) => {
                sinon.assert.calledWith(deleteObjectsStub, {
                    Bucket: sinon.match.string,
                    Delete: {
                        Objects: [{
                            Key: 'pictures/testpicture.jpg'
                        }]
                    }
                }, sinon.match.func);
                expect(res).to.be.eq('Data');

                deleteObjectsStub.restore();
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
        it('should call resize and upload image successfully', (done) => {
            const resizeStub = sandbox.stub(AWSService, 'resizeAndUploadImage').resolves();
            AWSService.postImage('key', 'file', 'image/png').then(() => {
                sinon.assert.calledThrice(resizeStub);
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('should call S3.putObject and error out', (done) => {
            const resizeStub = sandbox.stub(AWSService, 'resizeAndUploadImage').rejects('Error');
            AWSService.postImage('key', 'file', 'image/png').then((res) => {
                done(res);
            }).catch(() => {
                sinon.assert.calledThrice(resizeStub);
                done();
            });
        });
    });
});
