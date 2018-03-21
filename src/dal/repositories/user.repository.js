import mongoose from 'mongoose';

const User = mongoose.model('User');
const UserRepository = {
    get: query => mongoose.model('User').findOne(query),
    getAll: (conditions, projection = {}) => mongoose.model('User').find(conditions, projection),
    createUser: (username, name, email, password) => new Promise((resolve, reject) => {
        const user = new User();
        user.username = username;
        user.name = name;
        user.email = email;
        user.setPassword(password);

        user.save()
            .then(() => user.generateJwt())
            .then(tokenObj => resolve(tokenObj))
            .catch(err => reject(err));
    }),
    update: (username, user) => mongoose.model('User').findOneAndUpdate(
        { username },
        { $set: { ...user } },
        { new: true }
    ),
    remove: id => mongoose.model('User').findByIdAndRemove(id)
};

export default UserRepository;
