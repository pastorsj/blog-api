import mongoose from 'mongoose';

const subscription = new mongoose.Schema({
    endpoint: {
        type: String,
        required: true
    },
    expirationTime: {
        type: Number
    },
    keys: {
        p256dh: {
            type: String,
            required: true
        },
        auth: {
            type: String,
            required: true
        }
    }
});

const SubscriptionModel = mongoose.model('Subscription', subscription);

export default SubscriptionModel;
