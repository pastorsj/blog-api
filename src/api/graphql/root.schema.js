import { GraphQLSchema } from 'graphql';
import RootQuery from './queries/root.query';
import RootMutation from './mutations/root.mutation';

const RootSchema = new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation
});

export default RootSchema;
