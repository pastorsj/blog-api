import ArticleRepository from '../../dal/repositories/article.repository';
import ImageService from './image.service';
import UserService from './user.service';
import log from '../../log';

const ArticleService = {
    getAllArticlesForAuthor: username => ArticleRepository.getAll({ author: username }),
    getAllPublishedArticles: () => new Promise((resolve, reject) => {
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
    postCoverPhoto: (id, file) => new Promise((resolve, reject) =>
        ArticleRepository.get({ _id: id }).then((article) => {
            if (file) {
                const path = `cover_photo/cover_${id}`;
                ImageService.postImage(file, path)
                    .then((result) => {
                        const articleToUpdate = {
                            ...article,
                            coverPhoto: result.url
                        };
                        ArticleService.updateArticle(id, articleToUpdate)
                            .then(resolve)
                            .catch((error) => {
                                log.critical('Error while trying to save the blog with the new cover photo', error);
                                reject(error);
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
    updateArticle: (id, article) => new Promise((resolve, reject) => {
        const articleToUpdate = {
            ...article
        };
        if (article.isPublished) {
            articleToUpdate.datePosted = new Date(Date.now());
        }
        ArticleRepository.update(id, articleToUpdate).then((updatedArticle) => {
            if (updatedArticle) {
                resolve(updatedArticle);
            } else {
                reject(new Error('Unable to find the article to update'));
            }
        }).catch((error) => {
            log.critical('Unable to update article', error);
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
            log.critical('Error occured while deleting an article: ', error);
            reject(error);
        });
    })
};

export default ArticleService;
