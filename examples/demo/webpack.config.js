const path = require('path');

module.exports = {
    entry: path.join(__dirname, 'src', 'index.js'),
    output: {
        publicPath: '/out',
        path: path.join(__dirname, 'out'),
        filename: 'index.js'
    }
};
