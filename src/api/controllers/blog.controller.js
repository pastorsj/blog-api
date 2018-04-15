import ArticleService from '../../business/services/article.service';
import Response from './response';
import { upload } from '../../config/multer.config';

/**
 * ROUTE: blog/:id
 */

const BlogController = {
    post: (req, res) => {
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
    getAll: (req, res) => {
        ArticleService.getAllPublishedArticles().then((articles) => {
            Response.json(res, 200, articles);
        }).catch((err) => {
            Response.error(res, 404, err);
        });
    },
    get: (req, res) => {
        const { id } = req.params;
        ArticleService.getArticleById(id).then((article) => {
            Response.json(res, 200, article);
        }).catch((err) => {
            Response.error(res, 404, err);
        });
    },
    put: (req, res) => {
        const { id } = req.params;
        ArticleService.updateArticle(id, req.body).then((blog) => {
            Response.json(res, 200, blog);
        }).catch((err) => {
            Response.error(res, 404, err);
        });
    },
    delete: (req, res) => {
        const { id } = req.params;
        ArticleService.deleteArticle(id).then((message) => {
            Response.message(res, 200, message);
        }).catch((err) => {
            Response.error(res, 404, err);
        });
    },
    getByTag: (req, res) => {
        const { tag } = req.params;
        ArticleService.getByTag(tag).then((posts) => {
            Response.json(res, 200, posts);
        }).catch((err) => {
            Response.error(res, 404, err);
        });
    },
    getByTitle: (req, res) => {
        const { title } = req.params;
        ArticleService.getByTitle(title).then((titles) => {
            Response.json(res, 200, titles);
        }).catch((err) => {
            Response.error(res, 404, err);
        });
    }
};

export default BlogController;
