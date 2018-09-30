import ArticleService from '../../business/services/article.service';
import Response from './response';
import { upload } from '../../config/multer.config';

/**
 * ROUTE: blog/:id
 */

const ArticleController = {
    createArticle: (req, res) => {
        ArticleService.createArticle(req.body).then((blog) => {
            if (blog) {
                Response.json(res, 200, blog);
            } else {
                Response.json(res, 204, '');
            }
        }).catch((err) => {
            Response.error(res, 404, err);
        });
    },
    postCoverPhoto: (req, res) => {
        upload.single('coverPhoto')(req, res, (fileError) => {
            if (fileError) {
                Response.error(res, 400, 'The file uploaded was larger than 5mb');
            } else {
                ArticleService.postCoverPhoto(req.params.id, req.file).then((blog) => {
                    Response.json(res, 200, blog);
                }).catch((err) => {
                    Response.error(res, 404, err);
                });
            }
        });
    },
    getAllPublishedArticles: (req, res) => {
        ArticleService.getAllPublishedArticles(req.query).then((articles) => {
            Response.json(res, 200, articles);
        }).catch((err) => {
            Response.error(res, 404, err);
        });
    },
    getArticleById: (req, res) => {
        const { id } = req.params;
        ArticleService.getArticleById(id).then((article) => {
            Response.json(res, 200, article);
        }).catch((err) => {
            Response.error(res, 404, err);
        });
    },
    updateArticle: (req, res) => {
        const { id } = req.params;
        ArticleService.updateArticle(id, req.body).then((blog) => {
            Response.json(res, 200, blog);
        }).catch((err) => {
            Response.error(res, 404, err);
        });
    },
    deleteArticle: (req, res) => {
        const { id } = req.params;
        ArticleService.deleteArticle(id).then((message) => {
            Response.message(res, 200, message);
        }).catch((err) => {
            Response.error(res, 404, err);
        });
    },
    getByTag: (req, res) => {
        const { tag } = req.params;
        ArticleService.getByTag(tag, req.query).then((posts) => {
            Response.json(res, 200, posts);
        }).catch((err) => {
            Response.error(res, 404, err);
        });
    },
    getByTitle: (req, res) => {
        const { title } = req.params;
        ArticleService.getByTitle(title, req.query).then((titles) => {
            Response.json(res, 200, titles);
        }).catch((err) => {
            Response.error(res, 404, err);
        });
    },
    getAllArticlesByAuthor: (req, res) => {
        const { username } = req.params;
        ArticleService.getAllArticlesForAuthor(username, req.query).then((articles) => {
            Response.json(res, 200, articles);
        }).catch((err) => {
            Response.json(res, 404, `No articles found, error was ${err}`);
        });
    }
};

export default ArticleController;
