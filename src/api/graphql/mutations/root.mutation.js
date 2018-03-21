import { GraphQLObjectType } from 'graphql';
import { ArticleInputType, ArticleType } from '../models/article.model';
import ArticleService from '../../../business/services/article.service';

const RootMutation = new GraphQLObjectType({
    name: 'RootMutationType',
    fields: () => ({
        createArticle: {
            type: ArticleType,
            description: 'Create a new article',
            args: {
                article: { type: ArticleInputType }
            },
            resolve: async (value, { article }) => ArticleService.createArticle(article)
        }
    })
});

export default RootMutation;
