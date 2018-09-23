import {
    GraphQLObjectType, GraphQLID, GraphQLNonNull, GraphQLString
} from 'graphql';
import { ArticleCreateType, ArticleType, ArticleUpdateType } from '../models/article.model';
import ArticleService from '../../../business/services/article.service';
import UserType from '../models/user.model';
import UserService from '../../../business/services/user.service';

const RootMutation = new GraphQLObjectType({
    name: 'RootMutationType',
    fields: () => ({
        createArticle: {
            type: ArticleType,
            description: 'Create a new article',
            args: {
                article: { type: ArticleCreateType }
            },
            resolve: async (value, { article }) => ArticleService.createArticle(article)
        },
        updateArticle: {
            type: ArticleType,
            description: 'Update an article',
            args: {
                article: { type: ArticleUpdateType }
            },
            resolve: async (value, { article }) => ArticleService.updateArticle(article.id, article)
        },
        deleteArticle: {
            type: GraphQLString,
            description: 'Delete an article',
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve: async (value, { id }) => ArticleService.deleteArticle(id)
        },
        updateUser: {
            type: UserType,
            description: 'Update a user',
            args: {
                user: { type: UserType }
            },
            resolve: async (value, { user }) => UserService.updateUser(user.username, user)
        },
        deleteUser: {
            type: UserType,
            description: 'Delete a user',
            args: {
                username: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve: async (value, { username }) => UserService.deleteUser(username)
        }
    })
});

export default RootMutation;
