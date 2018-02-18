const DB_CONNECTION = process.env.MONGO ? process.env.MONGO : 'localhost';
export const DATABASE = `mongodb://${DB_CONNECTION}:27017/blog`; //eslint-disable-line