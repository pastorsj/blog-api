import mongoose from 'mongoose';

const ArticleRepository = {
    get: query => mongoose.model('BlogPost').findOne(query),
    getAll: (conditions, projection = {}) => mongoose.model('BlogPost').find(conditions, projection),
    create: article => mongoose.model('BlogPost').create(article),
    update: (id, article) => mongoose.model('BlogPost').findByIdAndUpdate(
        id,
        { $set: { ...article } },
        { new: true }
    ),
    remove: id => mongoose.model('BlogPost').findByIdAndRemove(id)
};

export default ArticleRepository;
