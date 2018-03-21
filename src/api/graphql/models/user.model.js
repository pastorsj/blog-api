import { GraphQLObjectType, GraphQLString } from 'graphql';

export const UserType = new GraphQLObjectType({
    name: 'User',
    description: 'This is my user type',
    fields: {
        username: { type: GraphQLString },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        joinedDate: { type: GraphQLString },
        profilePicture: { type: GraphQLString }
    }
});

export const UserUpdateType = new GraphQLObjectType({
    name: 'User',
    description: 'This is my user type',
    fields: {
        username: { type: GraphQLString },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        joinedDate: { type: GraphQLString },
        profilePicture: { type: GraphQLString }
    }
});
