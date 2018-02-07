import express from 'express';
import graphqlHTTP from 'express-graphql';

import { buildSchema } from 'graphql';

const router = express.Router();

const UserSchema = buildSchema(`
    type Query {
        username: String
    }
`);

const root = {
    username: () => 'Hello user'
};

// Availible via the base_url/articles route
router.route('/', graphqlHTTP({
    schema: UserSchema,
    rootValue: root,
    graphiql: true
}));

export default router;
