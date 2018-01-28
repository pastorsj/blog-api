import mongoose from 'mongoose';
import _ from 'lodash';

import ImageService from './image.service';
import log from '../log';

function retrieveAuthor(post) {
    return new Promise((resolve, reject) => {
        mongoose.model('User').find({ username: post.author }, { name: 1, username: 1 }).limit(1).exec((err, author) => {
            if (err || author.length < 1) {
                reject(err || 'No authors found');
            }
            const postObject = post.toObject();
            postObject.author = author.pop();
            resolve(postObject);
        });
    });
}

const ArticleService = {
    getAllArticlesForAuthor: username => mongoose.model('BlogPost').find({ author: username }),
    getAllArticles: () => new Promise((resolve, reject) => {
        mongoose.model('BlogPost').find({ isPublished: true }, { __v: 0 }).then((posts) => {
            const postPromises = [];
            posts.forEach((post) => {
                postPromises.push(retrieveAuthor(post));
            });
            Promise.all(postPromises).then((result) => {
                resolve(result);
            });
        }).catch((err) => {
            reject(err);
        });
    }),
    getArticleById: id => mongoose.model('BlogPost').findOne({ _id: id }),
    getByTag: tag => mongoose.model('BlogPost').find({
        tags: tag,
        isPublished: true
    }),
    getByTitle: (titlePrefix) => {
        const projection = {
            _id: 1,
            title: 1,
            tags: 1
        };
        return mongoose.model('BlogPost').find({
            title: {
                $regex: `^${titlePrefix}`,
                $options: 'i'
            },
            isPublished: true
        }, projection);
    },
    createArticle: article => mongoose.model('BlogPost').create(article),
    postCoverPhoto: (id, file) => new Promise((resolve, reject) => mongoose.model('BlogPost').findOne({
        _id: id
    }).then((article) => {
        if (file) {
            const path = `cover_photo/cover_${article._id}`;
            ImageService.postImage(file, path)
                .then((result) => {
                    article.coverPhoto = result.url; //eslint-disable-line
                    article.save((error) => {
                        if (error) {
                            log.critical('Error while trying to save the blog with the new cover photo', error);
                            resolve(error);
                        } else {
                            resolve(article);
                        }
                    });
                })
                .catch((error) => {
                    log.critical('Error while trying to post image', error);
                    reject(error);
                });
        } else {
            resolve('');
        }
    }).catch((err) => {
        log.critical('Article not found');
        reject(err);
    })),
    updateArticle: (id, article) => new Promise((resolve, reject) => mongoose.model('BlogPost').findOne({
        _id: id
    }).then((blog) => {
        _.assign(blog, article);
        if (article.isPublished) {
            blog.datePosted = Date.now(); //eslint-disable-line
        }
        blog.save((error) => {
            if (error) {
                log.critical('Failed to save article', error);
                reject(error);
            } else {
                resolve(blog);
            }
        });
    }).catch((err) => {
        log.critical('Article to update not found');
        reject(err);
    })),
    deleteArticle: id => new Promise((resolve, reject) => mongoose.model('BlogPost').findOne({
        _id: id
    }).then((article) => {
        article.remove((error) => {
            if (error) {
                log.critical('Failed to remove blog post');
                reject(error);
            } else {
                resolve(`The blog with the id ${article._id} was removed`);
            }
        });
    }).catch((err) => {
        log.critical('Error occured while deleting an article: ', err);
        reject(err);
    }))
};

export default ArticleService;
