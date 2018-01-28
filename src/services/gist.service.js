import gistify from 'node-gist-html';

const GistService = {
    post: link => gistify(link, { removeFooter: true })
};

export default GistService;
