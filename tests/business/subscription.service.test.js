import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';

import SubscriptionRepository from '../../src/dal/repositories/subscription.repository';
import SubscriptionService from '../../src/business/services/subscription.service';
import webpush from '../../src/config/subscription.config';

chai.use(sinonChai);

describe('Test the Subscription Service', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });
    describe('storeSubscription', () => {
        it('should store a new subscription', (done) => {
            const subscriptionRepoStub = sandbox.stub(SubscriptionRepository, 'create').resolves();
            SubscriptionService.storeSubscription({}).then(() => {
                sinon.assert.calledWith(subscriptionRepoStub, {});
                sinon.assert.calledOnce(subscriptionRepoStub);
                subscriptionRepoStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('should fail to store a new subscription', (done) => {
            const subscriptionRepoStub = sandbox.stub(SubscriptionRepository, 'create').rejects();
            SubscriptionService.storeSubscription({}).then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledOnce(subscriptionRepoStub);
                subscriptionRepoStub.restore();
                done();
            });
        });
    });
    describe('publishedArticleNotification', () => {
        it('should publish a new article notification', (done) => {
            const subscriptionServiceStub = sandbox.stub(SubscriptionService, 'sendNotification').resolves();
            SubscriptionService.publishedArticleNotification({title: 'New Article'}).then(() => {
                sinon.assert.calledWith(subscriptionServiceStub, {
                    notification: {
                        title: 'A new article was published',
                        body: 'Title: New Article',
                        vibrate: [100, 50, 100],
                        data: {
                            dateOfArrival: Date.now(),
                            primaryKey: 1
                        },
                        actions: [{
                            action: 'explore',
                            title: 'Go to the site'
                        }]
                    }
                });
                sinon.assert.calledOnce(subscriptionServiceStub);
                subscriptionServiceStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('should fail to publish a new article notification', (done) => {
            const subscriptionServiceStub = sandbox.stub(SubscriptionService, 'sendNotification').rejects();
            SubscriptionService.publishedArticleNotification({ title: 'New Article' }).then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledOnce(subscriptionServiceStub);
                subscriptionServiceStub.restore();
                done()
            });
        });
    });
    describe('sendNotification', () => {
        it('should send notifications to all subscriptions', (done) => {
            const subscriptionServiceStub = sandbox.stub(SubscriptionRepository, 'getAll').resolves([
                {
                    endpoint: 'https://fcm.googleapis.com/fcm/send/123'
                },
                {
                    endpoint: 'https://fcm.googleapis.com/fcm/send/456'
                },
                {
                    endpoint: 'https://fcm.googleapis.com/fcm/send/789'
                }
            ]);
            const webpushStub = sandbox.stub(webpush, 'sendNotification').resolves();
            SubscriptionService.sendNotification({ notification: 'New Notification' }).then(() => {
                sinon.assert.calledOnce(subscriptionServiceStub);
                sinon.assert.calledThrice(webpushStub);
                subscriptionServiceStub.restore();
                webpushStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('should fail to send notifications to all subscriptions', (done) => {
            const subscriptionServiceStub = sandbox.stub(SubscriptionRepository, 'getAll').resolves([
                {
                    endpoint: 'https://fcm.googleapis.com/fcm/send/123'
                },
                {
                    endpoint: 'https://fcm.googleapis.com/fcm/send/456'
                },
                {
                    endpoint: 'https://fcm.googleapis.com/fcm/send/789'
                }
            ]);
            const webpushStub = sandbox.stub(webpush, 'sendNotification').rejects();
            SubscriptionService.sendNotification({ notification: 'New Notification' }).then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledOnce(subscriptionServiceStub);
                sinon.assert.calledThrice(webpushStub);
                subscriptionServiceStub.restore();
                webpushStub.restore();
                done();
            });
        });
    });
});
