
export const DATABASE = process.env.NODE_ENV === 'TEST' ? 'mongodb://localhost/testblog' : 'mongodb://localhost/blog'; //eslint-disable-line
