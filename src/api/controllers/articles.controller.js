import ArticleService from '../../business/services/article.service';
import Response from './response';

/**
 * ROUTE: articles/:username
 */

const ArticlesController = {
    get: (req, res) => {
        const { username } = req.params;
        ArticleService.getAllArticlesForAuthor(username).then((articles) => {
            Response.json(res, 200, articles);
        }).catch((err) => {
            Response.json(res, 404, `No articles found, error was ${err}`);
        });
    }
};

export default ArticlesController;
