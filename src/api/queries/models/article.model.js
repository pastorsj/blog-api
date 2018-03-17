import { GraphQLObjectType, GraphQLString, GraphQLList, GraphQLBoolean, GraphQLInt } from 'graphql';

const ArticleType = new GraphQLObjectType({
    name: 'Article',
    description: 'This is my article type',
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

export default ArticleType;
