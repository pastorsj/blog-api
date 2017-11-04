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

export const setupArticlesCollection = async () => {
    const Article = mongoose.model('BlogPost');
    for (let a of articlesMock) { //eslint-disable-line
        const article = new Article();
        _.assign(article, a);
        await article.save(); //eslint-disable-line
    }
};

export const createCounter = async () => {
    const Counter = mongoose.model('IdentityCounter');
    const counter = new Counter();
    counter.model = 'BlogPost';
    counter.count = 0;
    counter.field = '_id';
    await counter.save();
};

export const resetCounter = async () => {
    await mongoose.model('IdentityCounter').collection.drop();
};

export const destroyArticlesCollection = async () => {
    await resetCounter();
    await mongoose.model('BlogPost').remove({});
};

