module.exports = function (global) {
    const EventEmitter = require('events');
    const windowEventEmitter = new EventEmitter();
    const noop = function () {};
    const pop = function () {
        windowEventEmitter.emit('popstate', {});
    };

    global.document = {
        title: ''
    };

    global.sessionStorage = {
        getItem: noop,
        setItem: noop
    };

    global.location = {
        protocol: '',
        hostname: '',
        port: '',
        pathname: '',
        search: '',
        hash: '',
        href: ''
    };

    global.history = {
        go: pop,
        back: pop,
        forward: pop,
        replaceState: noop,
        pushState: noop,
        scrollRestoration: 'auto'
    };

    global.window = {
        addEventListener: function () {
            return windowEventEmitter.addListener(...arguments);
        },
        removeEventListener: function () {
            return windowEventEmitter.removeListener(...arguments);
        },
        scrollTo: function (pageXOffset, pageYOffset) {
            this.pageYOffset = +pageYOffset || 0;
            this.eventEmitter.emit('scroll');
        },
        pageYOffset: 0,
        eventEmitter: windowEventEmitter
    };
};
