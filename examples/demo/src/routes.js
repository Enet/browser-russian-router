export default {
    index: {
        uri: '/',
        // {key} will be replaced with navigation key
        key: 'index.{key}'
    },
    user: {
        uri: '/user/{id}',
        params: {
            id: /\d+/
        },
        key: (matchObject) => {
            return 'user.' + matchObject.params.id
        }
    },
    about: {
        uri: '/about'
    },
    hello: {
        // Note the relative path here, that's not recommended to use
        uri: '?hello={entity}',
        params: {
            entity: /\w+/
        }
    }
};
