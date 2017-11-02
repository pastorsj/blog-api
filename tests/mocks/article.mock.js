import mongoose from 'mongoose';
import _ from 'lodash';

export const articlesMock = [
    {
        text: '<p>New Article</p>',
        title: 'My new article',
        description: 'An article of great importance',
        author: 'testuser',
        tags: ['redis', 'express', 'databases'],
        coverPhoto: 'https://imgur.com/somephoto.png',
        isPublished: true
    },
    {
        text: '<p>A great article on databases</p>',
        title: 'A new article of great importance',
        description: 'This is a test article',
        author: 'newuser',
        coverPhoto: '',
        tags: ['redis', 'databases'],
        isPublished: false
    },
    {
        text: '<p>New Article</p>',
        title: 'An unpublished article',
        description: 'This article is not published',
        author: 'testuser',
        isPublished: true,
        coverPhoto: '',
        tags: []
    }
];

export function setupArticlesCollection(done) {
    const Article = mongoose.model('BlogPost');
    const articleInserts = [];
    articlesMock.forEach((a) => {
        const article = new Article();
        _.assign(article, a);
        articleInserts.push(article.save());
    });
    Promise.all(articleInserts).then((res) => {
        done();
    }).catch((err) => {
        done(err);
    });
}

export function destroyArticlesCollection(done) {
    mongoose.model('BlogPost').remove({}).then(() => {
        done();
    }).catch((err) => {
        done(err);
    });
}
