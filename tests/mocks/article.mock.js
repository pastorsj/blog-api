export default [
    {
        text: '<p>New Article</p>',
        title: 'My new article',
        description: 'An article of great importance',
        author: 'testuser',
        tags: ['redis', 'express', 'databases'],
        coverPhoto: 'https://imgur.com/somephoto.png',
        datePosted: Date.now(),
        isPublished: true
    },
    {
        text: '<p>A great article on databases</p>',
        title: 'A new article of great importance',
        description: 'This is a test article',
        author: 'newuser',
        coverPhoto: '',
        tags: ['redis', 'databases'],
        isPublished: false
    },
    {
        text: '<p>New Article</p>',
        title: 'An unpublished article',
        description: 'This article is not published',
        author: 'testuser',
        isPublished: true,
        coverPhoto: '',
        tags: []
    }
];

