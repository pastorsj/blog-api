import converter from 'node-gist-html';

const GistService = {
    convert: link => converter.gistify(link)
};

export default GistService;
