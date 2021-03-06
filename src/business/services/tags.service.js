import ArticleRepository from '../../dal/repositories/article.repository';
import UserService from './user.service';

const TagService = {
    getTagsByPopularity: () => new Promise((resolve, reject) => {
        ArticleRepository.getAll({ isPublished: true }, {}, { tags: 1, _id: 0 }).then((tagSet) => {
            const allTags = {};
            tagSet.forEach((set) => {
                const { tags } = set;
                tags.forEach((tag) => {
                    allTags[tag] = allTags[tag] ? allTags[tag] + 1 : 1;
                });
            });
            resolve(allTags);
        }).catch((err) => {
            reject(err);
        });
    }),
    getArticlesByTag: tag => new Promise((resolve, reject) => {
        ArticleRepository.getAll({
            tags: tag,
            isPublished: true
        }, {}).then((posts) => {
            resolve(Promise.all(posts.map(post => UserService.retrieveAuthor(post))));
        }).catch((err) => {
            reject(err);
        });
    })
};

export default TagService;
