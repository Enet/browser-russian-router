export default {
    index: {
        uri: '/'
    },
    user: {
        uri: '/user/{id}',
        params: {
            id: /\d+/
        }
    },
    list: {
        uri: '/list/?filter={filter}',
        params: {
            filter: ['A', 'B', 'C']
        }
    }
};
