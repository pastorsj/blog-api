import { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLList } from 'graphql';
import ArticleService from '../../business/services/article.service';

const UserType = new GraphQLObjectType({
    name: 'User',
    description: 'This is my user type',
    fields: {
        username: { type: GraphQLString },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        joinedDate: { type: GraphQLString }
    }
});

const ArticleType = new GraphQLObjectType({
    name: 'Article',
    description: 'This is my article type',
    fields: {
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        text: { type: GraphQLString },
        author: { type: GraphQLString }
    }
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        users: {
            type: new GraphQLList(UserType),
            args: {},
            resolve() {
                return [
                    {
                        username: 'Test',
                        name: 'Test name',
                        email: 'test@test.com',
                        joinedDate: new Date(Date.now()).toLocaleDateString()
                    }
                ];
            }
        },
        articles: {
            type: new GraphQLList(ArticleType),
            args: {},
            async resolve() {
                return new Promise((resolve, reject) => {
                    ArticleService.getAllArticles().then((articles) => {
                        resolve(articles);
                    }).catch(reject);
                });
            }
        }
    }
});

const RootSchema = new GraphQLSchema({
    query: RootQuery
});

export default RootSchema;
