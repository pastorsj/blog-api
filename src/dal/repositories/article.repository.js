import mongoose from 'mongoose';

const ArticleRepository = {
    get: query => mongoose.model('BlogPost').findOne(query),
    getAll: (conditions, query, projection = {}) => {
        if (!!query.pageSize && !!query.page) {
            const pageSize = parseInt(query.pageSize, 10);
            const page = parseInt(query.page, 10);
            return mongoose.model('BlogPost')
                .find(conditions, projection)
                .sort({ datePosted: -1 })
                .skip(pageSize * (page - 1))
                .limit(pageSize);
        }
        return mongoose.model('BlogPost')
            .find(conditions, projection)
            .sort({ datePosted: -1 });
    },
    create: article => mongoose.model('BlogPost').create(article),
    update: (id, article) => mongoose.model('BlogPost').findByIdAndUpdate(
        id,
        { $set: { ...article } },
        { new: true }
    ),
    remove: id => mongoose.model('BlogPost').findByIdAndRemove(id)
};

export default ArticleRepository;
