import { GraphQLObjectType, GraphQLList, GraphQLNonNull, GraphQLString, GraphQLID } from 'graphql';
import ArticleService from '../../../business/services/article.service';
import UserType from '../models/user.model';
import UserService from '../../../business/services/user.service';
import { ArticleType } from '../models/article.model';

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: () => ({
        user: {
            type: UserType,
            args: { username: { type: new GraphQLNonNull(GraphQLString) } },
            resolve: async (parentValue, { username }) => UserService.getUser(username)
        },
        articles: {
            type: new GraphQLList(ArticleType),
            args: {
                username: { type: GraphQLString },
                tag: { type: GraphQLString },
                title: { type: GraphQLString }
            },
            resolve: async (parentValue, { username, tag, title }) => {
                if (username) {
                    return ArticleService.getAllArticlesForAuthor(username);
                } else if (tag) {
                    return ArticleService.getByTag(tag);
                } else if (title) {
                    return ArticleService.getByTitle(title);
                }
                return ArticleService.getAllPublishedArticles();
            }
        },
        article: {
            type: ArticleType,
            args: { id: { type: new GraphQLNonNull(GraphQLID) } },
            resolve: async (parentValue, { id }) => ArticleService.getArticleById(id)
        }
    })
});

export default RootQuery;
