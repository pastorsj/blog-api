import express from 'express';
import graphqlHTTP from 'express-graphql';
import RootSchema from '../queries/root.query';

const router = express.Router();

// Availible via the base_url/articles route
router.use('/', graphqlHTTP({
    schema: RootSchema,
    graphiql: true,
    formatError(err) {
        return {
            message: err.message,
            code: err.originalError && err.originalError.code,
            locations: err.locations,
            path: err.path
        };
    }
}));

export default router;
