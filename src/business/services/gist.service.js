import gistify from 'node-gist-html';

const GistService = {
    convert: link => gistify(link, { removeFooter: true })
};

export default GistService;
