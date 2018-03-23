import express from 'express';
import graphqlHTTP from 'express-graphql';
import RootSchema from '../graphql/root.schema';
import { auth } from '../../config/jwt.config';

const router = express.Router();

// Availible via the base_url/articles route
router.use('/', auth, graphqlHTTP({
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
