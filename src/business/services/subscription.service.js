import SubscriptionRepository from '../../dal/repositories/subscription.repository';
import webpush from '../../config/subscription.config';

const SubscriptionService = {
    storeSubscription: subscription => new Promise((resolve, reject) => {
        SubscriptionRepository.create(subscription).then(resolve).catch(reject);
    }),
    publishedArticleNotification: article => new Promise((resolve, reject) => {
        const notification = {
            notification: {
                title: 'A new article was published',
                body: `Title: ${article.title}`,
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
        };
        SubscriptionService.sendNotification(notification)
            .then(resolve)
            .catch(reject);
    }),
    sendNotification: notificationPayload => new Promise((resolve, reject) => {
        SubscriptionRepository.getAll().then((subscriptions) => {
            const notification = JSON.stringify(notificationPayload);
            Promise.all(subscriptions.map(subscription => webpush.sendNotification(subscription, notification)))
                .then(resolve)
                .catch(reject);
        }).catch(reject);
    })
};

export default SubscriptionService;
