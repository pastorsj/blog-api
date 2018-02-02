import mongoose from 'mongoose';

const UserRepository = {
    get: query => mongoose.model('User').findOne(query),
    getAll: (conditions, projection = {}) => mongoose.model('User').find(conditions, projection)
};

export default UserRepository;
