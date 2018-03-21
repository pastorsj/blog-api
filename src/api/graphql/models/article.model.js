import { GraphQLObjectType, GraphQLString, GraphQLList, GraphQLBoolean, GraphQLInt, GraphQLInputObjectType, GraphQLNonNull } from 'graphql';

export const ArticleType = new GraphQLObjectType({
    name: 'Article',
    description: 'The article query type',
    fields: {
        _id: { type: GraphQLInt },
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        text: { type: GraphQLString },
        author: { type: GraphQLString },
        tags: { type: GraphQLList(GraphQLString) },
        coverPhoto: { type: GraphQLString },
        isPublished: { type: GraphQLBoolean }
    }
});

export const ArticleInputType = new GraphQLInputObjectType({
    name: 'ArticleInput',
    description: 'The article input type',
    fields: ({
        title: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: new GraphQLNonNull(GraphQLString) },
        text: { type: new GraphQLNonNull(GraphQLString) },
        author: { type: new GraphQLNonNull(GraphQLString) },
        tags: { type: GraphQLList(GraphQLString) },
        coverPhoto: { type: GraphQLString },
        isPublished: { type: GraphQLBoolean }
    })
});
