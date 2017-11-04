import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import FroalaEditor from 'wysiwyg-editor-node-sdk';
import fs from 'fs';

import AWSService from '../../src/services/aws.service';
import ImageService from '../../src/services/image.service';

const { expect } = chai;

chai.use(sinonChai);

describe('Test the image service', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });
    afterEach(() => {
        sandbox.restore();
    });
    describe('deleteImage', () => {
        it('should call AWSService.deleteImage function and return successfully', (done) => {
            sandbox.stub(AWSService, 'deleteImage').resolves('Data');
            ImageService.deleteImage('https://flickr.com').then((res) => {
                expect(res).to.be.eq('Data');
                done();
            }).catch((err) => {
                done(err);
            });
        });
    });
    describe('getImage', () => {
        it('should retreive the has from the FroalaEditor library', () => {
            sandbox.stub(FroalaEditor.S3, 'getHash').returns(1234567890);
            const imageHash = ImageService.getImage();
            expect(imageHash).to.be.eq(1234567890);
        });
    });
    describe('postImage', () => {
        let file;
        const filePath = 'tests/common/';
        const originalFile = `${filePath}testing.png`;
        const copiedFile = `${filePath}testing-copy.png`;

        beforeEach(() => {
            fs.copyFileSync(originalFile, copiedFile);
            file = fs.readFileSync(copiedFile);
        });
        afterEach(() => {
            if (fs.existsSync(copiedFile)) {
                fs.unlinkSync(copiedFile);
            }
        });
        it('should call the AWSService.postImage function and return successfully', (done) => {
            const postImageStub = sandbox.stub(AWSService, 'postImage').resolves('Data');
            ImageService.postImage({ path: copiedFile, mimetype: 'image/png' }, 'path').then((res) => {
                expect(res).to.be.eq('Data');
                postImageStub.restore();
                sinon.assert.calledWith(postImageStub, 'path.png', file, 'image/png');
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('should call the AWSService.postImage function and error out', (done) => {
            const postImageStub = sandbox.stub(AWSService, 'postImage').rejects();
            ImageService.postImage({ path: copiedFile, mimetype: 'image/png' }, 'path').then((res) => {
                done(res);
            }).catch((err) => {
                expect(err.message).to.be.eq('Error when posting image: Error: Error');
                postImageStub.restore();
                sinon.assert.calledWith(postImageStub, 'path.png', file, 'image/png');
                return done();
            });
        });
        it('should call the AWSService.postImage function and catch the error thrown', (done) => {
            sandbox.stub(AWSService, 'postImage').throws(new Error(''));
            ImageService.postImage({ path: copiedFile, mimetype: 'image/png' }, 'path').then((res) => {
                done(res);
            }).catch((err) => {
                expect(err.message).to.be.a('string');
                return done();
            });
        });
    });
});
