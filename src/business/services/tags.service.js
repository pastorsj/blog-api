import mongoose from 'mongoose';

/**
 * Retrieves the full author for a blog post
 * @param {Object} post - A blog post
 * @returns {Promise} - Either it returns the updated post or an error
 */
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

const TagService = {
    getTagsByPopularity: () => new Promise((resolve, reject) => {
        try {
            mongoose.model('BlogPost').find({ isPublished: true }, { tags: 1, _id: 0 }).then((tagSet) => {
                const allTags = {};
                tagSet.forEach((set) => {
                    const { tags } = set;
                    tags.forEach((tag) => {
                        allTags[tag] = allTags[tag] ? allTags[tag] + 1 : 1;
                    });
                });
                resolve(allTags);
            }).catch((err) => {
                reject(err || 'Blog Post Not Found');
            });
        } catch (error) {
            reject(error);
        }
    }),
    getArticlesByTag: tag => new Promise((resolve, reject) => {
        try {
            mongoose.model('BlogPost').find({
                tags: tag,
                isPublished: true
            }).then((posts) => {
                const postPromises = [];
                posts.forEach((post) => {
                    postPromises.push(retrieveAuthor(post));
                });
                resolve(Promise.all(postPromises));
            }).catch((err) => {
                reject(err || 'Blog Post Not Found');
            });
        } catch (error) {
            reject(error);
        }
    })
};

export default TagService;
