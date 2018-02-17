import converter from 'node-gist-html';

const GistService = {
    convert: link => converter.gistify(link, { removeFooter: true })
};

export default GistService;
