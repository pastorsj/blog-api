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
            resolve: async (parentValue, args) => UserService.getUser(args.username)
        },
        articles: {
            type: new GraphQLList(ArticleType),
            args: {
                username: { type: GraphQLString },
                tag: { type: GraphQLString },
                title: { type: GraphQLString }
            },
            resolve: async (parentValue, args) => {
                if (args.username) {
                    return ArticleService.getAllArticlesForAuthor(args.username);
                } else if (args.tag) {
                    return ArticleService.getByTag(args.tag);
                } else if (args.title) {
                    return ArticleService.getByTitle(args.title);
                }
                return ArticleService.getAllPublishedArticles();
            }
        },
        article: {
            type: ArticleType,
            args: { id: { type: new GraphQLNonNull(GraphQLID) } },
            resolve: async (parentValue, args) => ArticleService.getArticleById(args.id)
        }
    })
});

export default RootQuery;
