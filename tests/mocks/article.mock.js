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
        datePosted: Date.now(),
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

export const setupArticlesCollection = async (done) => {
    const Article = mongoose.model('BlogPost');
    try {
        for (let a of articlesMock) { //eslint-disable-line
            const article = new Article();
            _.assign(article, a);
            await article.save(); //eslint-disable-line
        }
        done();
    } catch (e) {
        done(e);
    }
};

export const createCounter = async (done) => {
    try {
        const Counter = mongoose.model('IdentityCounter');
        const counter = new Counter();
        counter.model = 'BlogPost';
        counter.count = 0;
        counter.field = '_id';
        await counter.save();
        done();
    } catch (e) {
        done(e);
    }
};

export function resetCounter(done) {
    mongoose.model('IdentityCounter').collection.drop().then(() => {
        done();
    }).catch((err) => {
        done(err);
    });
}

export function destroyArticlesCollection(done) {
    resetCounter((err) => {
        if (err) {
            done(err);
        }
        mongoose.model('BlogPost').remove({}).then(() => {
            done();
        }).catch((error) => {
            done(error);
        });
    });
}

