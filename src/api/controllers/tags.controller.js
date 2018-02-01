import RedisService from '../../business/services/redis.service';
import TagService from '../../business/services/tags.service';
import Response from './response';

const SET_NAME = 'tags';

/**
 * ROUTE: tags/
 */

const TagsController = {
    post: (req, res) => {
        const { tag } = req.body;
        RedisService.addNew(tag, SET_NAME)
            .then((result) => {
                Response.json(res, 204, result);
            }).catch((err) => {
                Response.error(res, 400, err);
            });
    },
    getPrefixes: async (req, res) => {
        const { prefix, count } = req.body;
        RedisService.getPrefixes(prefix, count, SET_NAME)
            .then((prefixes) => {
                Response.json(res, 200, prefixes);
            }).catch((err) => {
                Response.json(res, 400, err);
            });
    },
    getTagsByPopularity: (req, res) => {
        TagService.getTagsByPopularity().then((allTags) => {
            Response.json(res, 200, allTags);
        }).catch((err) => {
            Response.error(res, 404, err);
        });
    },
    getArticlesByTag: (req, res) => {
        const { tag } = req.params;
        TagService.getArticlesByTag(tag).then((articles) => {
            Response.json(res, 200, articles);
        }).catch((err) => {
            Response.error(res, 404, err);
        });
    }
};

export default TagsController;
