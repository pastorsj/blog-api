import ArticleService from '../services/article.service';
import Response from '../config/response.config';

/**
 * ROUTE: articles/:username
 */

const ArticlesController = {
    get: (req, res) => {
        const { username } = req.params;
        ArticleService.getAllArticlesForAuthor(username).then((articles) => {
            Response.json(res, 200, articles);
        }).catch((err) => {
            Response.json(res, 404, err || 'Articles Not Found');
        });
    }
};

export default ArticlesController;
