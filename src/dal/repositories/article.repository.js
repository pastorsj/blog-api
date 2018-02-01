import mongoose from 'mongoose';

const ArticleRepository = {
    get: query => mongoose.model('BlogPost').findOne(query),
    getAll: (conditions, projection = {}) => mongoose.model('BlogPost').find(conditions, projection),
    create: () => {

    },
    update: () => {

    },
    delete: (id) => {

    }
};

export default ArticleRepository;
