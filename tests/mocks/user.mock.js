import mongoose from 'mongoose';
import _ from 'lodash';


// username: testuser
// password: test
export const userMock = {
    hash: '592a655afc393cae731811f8cb69c3579309d974769c9d08641c301ef2add46ab4dd3cbbaf8134072bfb8a93cffa2b576fdb0fb097fb07c4774e520df8331beb',
    salt: '46202c0c449726d7c5da6f09f87854a2',
    email: 'testuser@test.com',
    name: 'Test User',
    username: 'testuser'
};

export function setupUserCollection(done) {
    const User = mongoose.model('User');
    const user = new User();
    _.assign(user, userMock);
    user.save().then(() => {
        done();
    }).catch((err) => {
        done(err);
    });
}

export function destroyUsersCollection(done) {
    mongoose.model('User').remove({}).then(() => {
        done();
    }).catch((err) => {
        done(err);
    });
}
