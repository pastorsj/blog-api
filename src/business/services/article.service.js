import _ from 'lodash';

import ArticleRepository from '../../dal/repositories/article.repository';
import ImageService from './image.service';
import UserService from './user.service';
import log from '../../log';

const ArticleService = {
    getAllArticlesForAuthor: username => ArticleRepository.getAll({ author: username }),
    getAllArticles: () => new Promise((resolve, reject) => {
        ArticleRepository.getAll({ isPublished: true }, { __v: 0 }).then((posts) => {
            const postPromises = [];
            posts.forEach((post) => {
                postPromises.push(UserService.retrieveAuthor(post));
            });
            Promise.all(postPromises).then((result) => {
                resolve(result);
            });
        }).catch((err) => {
            reject(err);
        });
    }),
    getArticleById: id => ArticleRepository.get({ _id: id }),
    getByTag: tag => ArticleRepository.getAll({
        tags: tag,
        isPublished: true
    }),
    getByTitle: (titlePrefix) => {
        const projection = {
            _id: 1,
            title: 1,
            tags: 1
        };
        return ArticleRepository.getAll({
            title: {
                $regex: `^${titlePrefix}`,
                $options: 'i'
            },
            isPublished: true
        }, projection);
    },
    createArticle: article => ArticleRepository.create(article),
    postCoverPhoto: (id, file) => new Promise((resolve, reject) => ArticleRepository.get({ _id: id }).then((article) => {
        if (file) {
            const path = `cover_photo/cover_${article._id}`;
            ImageService.postImage(file, path)
                .then((result) => {
                    article.coverPhoto = result.url; //eslint-disable-line
                    article.save((error) => {
                        if (error) {
                            log.critical('Error while trying to save the blog with the new cover photo', error);
                            reject(error);
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
    updateArticle: (id, article) => new Promise((resolve, reject) => ArticleRepository.get({ _id: id }).then((blog) => {
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
    deleteArticle: id => new Promise((resolve, reject) => ArticleRepository.get({
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
