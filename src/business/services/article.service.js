import ArticleRepository from '../../dal/repositories/article.repository';
import ImageService from './image.service';
import UserService from './user.service';
import log from '../../log';
import SubscriptionService from './subscription.service';

const ArticleService = {
    getAllArticlesForAuthor: (username, query) => ArticleRepository.getAll({ author: username }, query),
    getAllPublishedArticles: query => new Promise((resolve, reject) => {
        ArticleRepository.getAll({ isPublished: true }, query, { __v: 0 }).then((posts) => {
            Promise.all(posts.map(post => UserService.retrieveAuthor(post))).then((result) => {
                resolve(result);
            });
        }).catch((err) => {
            reject(err);
        });
    }),
    getArticleById: id => ArticleRepository.get({ _id: id }),
    getByTag: (tag, query) => ArticleRepository.getAll({
        tags: tag,
        isPublished: true
    }, query),
    getByTitle: (titlePrefix, query) => {
        if (!titlePrefix) {
            return Promise.resolve([]);
        }
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
        }, query, projection);
    },
    createArticle: article => ArticleRepository.create(article),
    postCoverPhoto: (id, file) => new Promise((resolve, reject) => ArticleRepository.get({ _id: id }).then((article) => {
        if (file && article) {
            const path = `cover_photo/cover_${article._id}`;
            ImageService.updateImage(file, path, article.coverPhoto)
                .then((result) => {
                    const articleToUpdate = {
                        ...article.toObject(),
                        coverPhoto: result.url
                    };
                    ArticleService.updateArticle(id, articleToUpdate)
                        .then(resolve)
                        .catch((error) => {
                            log.error('Error while trying to save the blog with the new cover photo', error);
                            reject(error);
                        });
                })
                .catch((error) => {
                    log.error('Error while trying to post image', error);
                    reject(error);
                });
        } else {
            resolve('');
        }
    }).catch((err) => {
        log.error('Article not found');
        reject(err);
    })),
    updateArticle: (id, article) => new Promise((resolve, reject) => {
        const articleToUpdate = {
            ...article
        };
        let wasArticlePublished = false;
        if (article.isPublished) {
            articleToUpdate.datePosted = new Date(Date.now());
            wasArticlePublished = true;
        }
        ArticleRepository.update(id, articleToUpdate).then((updatedArticle) => {
            if (updatedArticle) {
                if (wasArticlePublished) {
                    SubscriptionService.publishedArticleNotification(updatedArticle)
                        .then(resolve(updatedArticle))
                        .catch(new Error('Unable to send article notification'));
                } else {
                    resolve(updatedArticle);
                }
            } else {
                reject(new Error('Unable to find the article to update'));
            }
        }).catch((error) => {
            log.error('Unable to update article', error);
            reject(new Error('Unable to update article', error));
        });
    }),
    deleteArticle: id => new Promise((resolve, reject) => {
        ArticleRepository.remove(id).then((deletedArticle) => {
            if (deletedArticle) {
                resolve(`The blog with the id ${id} was removed`);
            } else {
                reject(new Error(`Blog post with id ${id} does not exist`));
            }
        }).catch((error) => {
            log.error('Error occured while deleting an article: ', error);
            reject(error);
        });
    })
};

export default ArticleService;
