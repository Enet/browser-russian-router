const routes = {
    index: {
        uri: '/',
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
        uri: '?hello={entity}',
        params: {
            entity: /\w+/
        }
    }
};
const options = {
    scrollRestoration: 'auto'
};
const locations = {
    custom: {
        pathname: '/',
        search: '?hello=world'
    },
    index: {
        protocol: 'https',
        hostname: 'google.com',
        pathname: '/'
    },
    user: {
        protocol: 'https',
        hostname: 'google.com',
        pathname: '/user/123'
    },
    about: {
        port: '8080',
        pathname: '/about'
    }
};

function applyLocation (locationName, extensionObject) {
    Object.assign(location, {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: null,
        search: '',
        hash: ''
    }, locations[locationName], extensionObject);
    location.href = [
        location.protocol ? location.protocol + '://' : '//',
        location.hostname,
        location.port ? ':' + location.port : '',
        location.pathname || '',
        location.search,
        location.hash
    ].join('');
}

beforeEach(() => {
    jest.resetModules();
    require('./reset.js')(global);
});

test('Router matches current uri during initialization', () => {
    const {BrowserRussianRouter} = require('browser-russian-router');
    applyLocation('index');

    const router = new BrowserRussianRouter(routes, options);
    expect(router.getMatchObjects().length).toBe(1);
    expect(router.getMatchObjects()[0].name).toBe('index');
    expect(router.getMatchObjects()[0].domain).toBe('google.com');

});

test('Router matches current uri during initialization', () => {
    const {BrowserRussianRouter} = require('browser-russian-router');
    applyLocation('user');

    const router = new BrowserRussianRouter(routes, options);
    expect(router.getMatchObjects().length).toBe(1);
    expect(router.getMatchObjects()[0].name).toBe('user');
    expect(router.getMatchObjects()[0].params.id).toBe('123');
});

test('Router extracts the keys correctly', () => {
    const {BrowserRussianRouter} = require('browser-russian-router');
    applyLocation('index');

    const router = new BrowserRussianRouter(routes, options);
    expect(router.getMatchObjects()[0].key).toBe('User/index.0');
});

test('Router extracts the keys correctly', () => {
    const {BrowserRussianRouter} = require('browser-russian-router');
    applyLocation('user');

    const router = new BrowserRussianRouter(routes, options);
    expect(router.getMatchObjects()[0].key).toBe('User/user.123');
});

test('Router extracts the keys correctly', () => {
    const {BrowserRussianRouter} = require('browser-russian-router');
    applyLocation('about');

    const router = new BrowserRussianRouter(routes, options);
    expect(router.getMatchObjects()[0].key).toBe('RussianRouter/about');
});

test('Router resolves uri correctly', () => {
    const {BrowserRussianRouter} = require('browser-russian-router');
    applyLocation('user');

    const router = new BrowserRussianRouter(routes, options);
    expect(router.resolveUri('delete')).toBe('/user/123/delete');
    expect(router.resolveUri('?xyz=777')).toBe('/user/123?xyz=777');
    expect(router.resolveUri('#матрёшка')).toBe('/user/123#матрёшка');
    expect(router.resolveUri('?xyz=777#матрёшка')).toBe('/user/123?xyz=777#матрёшка');
    expect(router.resolveUri('/already/resolved/')).toBe('/already/resolved/');
});

test('Router considers query when resolving relative uri', () => {
    const {BrowserRussianRouter} = require('browser-russian-router');
    applyLocation('custom');

    const router = new BrowserRussianRouter(routes, options);
    expect(router.resolveUri('')).toBe('/?hello=world');
});

test('Router matches uri correctly', () => {
    const {BrowserRussianRouter} = require('browser-russian-router');
    applyLocation('custom');

    const router = new BrowserRussianRouter(routes, options);
    expect(router.getMatchObjects().length).toBe(2);
});

test('Router matches uri correctly', () => {
    const {BrowserRussianRouter} = require('browser-russian-router');
    applyLocation('user');

    const router = new BrowserRussianRouter(routes, options);
    expect(router.matchUri('?hello=world').length).toBe(2);
});

test('Router generates uri correctly', () => {
    const {BrowserRussianRouter} = require('browser-russian-router');
    applyLocation('user');

    const router = new BrowserRussianRouter(routes, {
        dataConsistency: false
    });
    expect(router.generateUri('hello', {entity: 'world'})).toBe('/user/123?hello=world');
    expect(router.generateUri('hello', {entity: null})).toBe('/user/123?hello=');
    expect(router.generateUri('hello')).toBe('/user/123?hello=');
});

test('Router returns correct navigation key', () => {
    const {BrowserRussianRouter} = require('browser-russian-router');
    applyLocation('user');

    const router = new BrowserRussianRouter(routes, options);
    expect(router.getNavigationKey()).toBe(0);
    router.forward();
    expect(router.getNavigationKey()).toBe(1);
    router.back();
    expect(router.getNavigationKey()).toBe(2);
});

test('Router returns correct default values', () => {
    const {BrowserRussianRouter} = require('browser-russian-router');
    const {utils} = require('russian-router');
    applyLocation('custom');

    const router = new BrowserRussianRouter(routes, options);
    utils.forEachPartName((partName, p) => {
        const defaultPart = router.getDefaultPart(partName);
        const PartConstructor = utils.getPartConstructor(partName);
        expect(defaultPart).toBeInstanceOf(PartConstructor);
        if (partName === 'protocol') {
            expect(defaultPart + '').toBe('http');
        } else if (partName === 'domain') {
            expect(defaultPart + '').toBe('localhost');
        } else if (partName === 'port') {
            expect(defaultPart + '').toBe('80');
        } else {
            expect(defaultPart + '').toBe('');
        }
    });
});

test('Router listens popstate event', () => {
    const {addEventListener} = window;
    window.addEventListener = jest.fn();
    const {BrowserRussianRouter} = require('browser-russian-router');
    expect(window.addEventListener).toBeCalled();
    window.addEventListener = addEventListener;
});

test('Router navigation methods work correctly', () => {
    const navigationMethodNames = ['go', 'back', 'forward', 'pushState', 'replaceState'];
    const navigationMethods = navigationMethodNames.map((name) => history[name]);
    navigationMethodNames.forEach((name, n) => history[name] = jest.fn(navigationMethods[n]));

    applyLocation('index');
    const {pushUri, replaceUri, go, back, forward, BrowserRussianRouter} = require('browser-russian-router');
    const onUriChange = jest.fn();
    BrowserRussianRouter.prototype._onUriChange = function () {
        onUriChange(...arguments);
    };
    const router = new BrowserRussianRouter(routes, options);

    pushUri('/1');
    replaceUri('/2');
    back();
    forward();
    go(3);
    router.back();
    router.forward();
    router.go(-3);
    router.pushUri('/4');
    router.replaceUri('/5');
    router.pushRoute('index');
    router.replaceRoute('about');

    expect(history.back).toHaveBeenCalledTimes(2);
    expect(history.forward).toHaveBeenCalledTimes(2);
    expect(history.go).toHaveBeenCalledTimes(2);
    expect(history.go.mock.calls[0][0]).toBe(3);
    expect(history.go.mock.calls[1][0]).toBe(-3);

    expect(history.pushState).toHaveBeenCalledTimes(3);
    expect(history.pushState.mock.calls[0][2]).toBe('/1');
    expect(history.pushState.mock.calls[1][2]).toBe('/4');
    expect(history.pushState.mock.calls[2][2]).toBe('/');

    expect(history.replaceState).toHaveBeenCalledTimes(3);
    expect(history.replaceState.mock.calls[0][2]).toBe('/2');
    expect(history.replaceState.mock.calls[1][2]).toBe('/5');
    expect(history.replaceState.mock.calls[2][2]).toBe('/about');

    expect(onUriChange.mock.calls[0][0].reason).toBe('popstate');
    expect(onUriChange.mock.calls[1][0].reason).toBe('pushstate');
    expect(onUriChange.mock.calls[2][0].reason).toBe('replacestate');
    expect(onUriChange.mock.calls[3][0].reason).toBe('popstate');
    expect(onUriChange.mock.calls[4][0].reason).toBe('popstate');
    expect(onUriChange.mock.calls[5][0].reason).toBe('popstate');
    expect(onUriChange.mock.calls[6][0].reason).toBe('popstate');
    expect(onUriChange.mock.calls[7][0].reason).toBe('popstate');
    expect(onUriChange.mock.calls[8][0].reason).toBe('popstate');
    expect(onUriChange.mock.calls[9][0].reason).toBe('pushstate');
    expect(onUriChange.mock.calls[10][0].reason).toBe('replacestate');
    expect(onUriChange.mock.calls[11][0].reason).toBe('pushstate');
    expect(onUriChange.mock.calls[12][0].reason).toBe('replacestate');
    expect(router.getNavigationKey()).toBe(12);

    navigationMethodNames.forEach((name) => window[name] = navigationMethods[name]);
});

test('Router matches uri when it is changed', () => {
    const {BrowserRussianRouter} = require('browser-russian-router');
    applyLocation('user');

    const router = new BrowserRussianRouter(routes, options);
    const matchObjects = router.getMatchObjects();

    applyLocation('index');
    router.pushRoute('index');
    expect(router.getMatchObjects()).not.toBe(matchObjects);
});

test('Router adds and removes listeners', () => {
    const {BrowserRussianRouter} = require('browser-russian-router');
    applyLocation('user');

    const router = new BrowserRussianRouter(routes, options);
    const listener = jest.fn();
    router.addListener('change', listener);
    router.pushRoute('index');
    expect(listener).toHaveBeenCalled();
    router.removeListener('change', listener);
    router.pushRoute('user', {id: 1});
    expect(listener).toHaveBeenCalledTimes(1);
});

test('Router removes its own listener when it is destructed', () => {
    const {pushUri, BrowserRussianRouter} = require('browser-russian-router');
    const onUriChange = jest.fn();
    BrowserRussianRouter.prototype._onUriChange = function () {
        onUriChange(...arguments)
    };
    applyLocation('user');

    const router = new BrowserRussianRouter(routes, options);
    expect(onUriChange).toHaveBeenCalledTimes(1);
    pushUri('/');
    expect(onUriChange).toHaveBeenCalledTimes(2);
    router.destructor();
    pushUri('/1/2/3');
    expect(onUriChange).toHaveBeenCalledTimes(2);
});

test('Router handles scrollRestoration property correctly', () => {
    const {BrowserRussianRouter} = require('browser-russian-router');
    applyLocation('index');

    expect(history.scrollRestoration === 'auto');
    new BrowserRussianRouter(routes, {scrollRestoration: ''});
    expect(history.scrollRestoration === 'auto');
    new BrowserRussianRouter(routes, {scrollRestoration: 'asdf'});
    expect(history.scrollRestoration === 'auto');
    new BrowserRussianRouter(routes, {scrollRestoration: 'reset'});
    expect(history.scrollRestoration === 'manual');
    new BrowserRussianRouter(routes, {scrollRestoration: 'auto'});
    expect(history.scrollRestoration === 'manual');
});

test('Router updates scroll position for current uri', () => {
    const {BrowserRussianRouter} = require('browser-russian-router');
    applyLocation('index');
    const {setItem} = sessionStorage;
    sessionStorage.setItem = jest.fn();

    new BrowserRussianRouter(routes, {scrollRestoration: 'auto'});
    window.scrollTo(0, 123);
    expect(sessionStorage.setItem).toHaveBeenCalled();
    expect(sessionStorage.setItem.mock.calls[0][0]).toBe('BrowserReactRouter/Scroll~' + location.href);
    expect(sessionStorage.setItem.mock.calls[0][1]).toBe(window.pageYOffset);

    sessionStorage.setItem = setItem;
});

test('Router restores scroll position correctly', () => {
    const {BrowserRussianRouter} = require('browser-russian-router');
    applyLocation('index');
    const {getItem, setItem} = sessionStorage;
    sessionStorage.getItem = jest.fn(function () {
        return 123;
    });
    sessionStorage.setItem = jest.fn(function () {

    });
    window.scrollTo(0, 777); // азино три топора - началась игра
    expect(window.pageYOffset).toBe(777);

    let router;
    router = new BrowserRussianRouter(routes, {scrollRestoration: 'manual'});
    router.restoreScroll();
    expect(sessionStorage.getItem).not.toHaveBeenCalled();
    expect(window.pageYOffset).toBe(777);

    router = new BrowserRussianRouter(routes, {scrollRestoration: 'reset'});
    router.restoreScroll();
    expect(sessionStorage.getItem).not.toHaveBeenCalled();
    expect(window.pageYOffset).toBe(0);

    router = new BrowserRussianRouter(routes, {scrollRestoration: 'auto'});
    router.restoreScroll();
    expect(sessionStorage.getItem).toHaveBeenCalled();
    expect(window.pageYOffset).toBe(123);
    router.replaceRoute('about');
    router.restoreScroll();
    expect(sessionStorage.setItem).toHaveBeenCalled();
    expect(window.pageYOffset).toBe(0);

    sessionStorage.getItem = getItem;
    sessionStorage.setItem = setItem;
});

test('Scroll storage has fallback if session storage is not available', () => {
    const {sessionStorage} = global;
    global.sessionStorage = null;
    const {scrollStorage} = require('browser-russian-router');
    scrollStorage.setItem('/', 123);
    expect(scrollStorage.getItem('/')).toBe(123);
    global.sessionStorage = sessionStorage;
});
