import { GraphQLObjectType, GraphQLSchema, GraphQLList, GraphQLNonNull, GraphQLString, GraphQLID } from 'graphql';
import ArticleService from '../../business/services/article.service';
import UserType from './models/user.model';
import ArticleType from './models/article.model';
import UserService from '../../business/services/user.service';
import AuthService from '../../business/services/auth.service';

const checkAuth = async (request) => {
    if (request && request.headers && request.headers.authorization) {
        const authorizationHeader = request.headers.authorization.toString();
        if (authorizationHeader.startsWith('Bearer ')) {
            const token = authorizationHeader.slice(7);
            return AuthService.validateJwt(token);
        }
    }
    return Promise.reject(new Error('Unauthorized'));
};

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: { username: { type: new GraphQLNonNull(GraphQLString) } },
            async resolve(parentValue, args, context) {
                await checkAuth(context);
                return UserService.getUser(args.username);
            }
        },
        articles: {
            type: new GraphQLList(ArticleType),
            args: {},
            async resolve() {
                return ArticleService.getAllArticles();
            }
        },
        article: {
            type: ArticleType,
            args: { id: { type: new GraphQLNonNull(GraphQLID) } },
            async resolve(parentValue, args) {
                return ArticleService.getArticleById(args.id);
            }
        }
    }
});

const RootSchema = new GraphQLSchema({
    query: RootQuery
});

export default RootSchema;
