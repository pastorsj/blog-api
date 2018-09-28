import mongoose from 'mongoose';

const SubscriptionRepository = {
    getAll: () => mongoose.model('Subscription').find(),
    create: subscription => mongoose.model('Subscription').create(subscription)
};

export default SubscriptionRepository;
