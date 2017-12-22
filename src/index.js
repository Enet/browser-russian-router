import RussianRouter, {
    utils
} from 'russian-router';
import EventEmitter from 'events';

const availableScrollRestorations = ['manual', 'auto', 'reset'];
const Protocol = utils.getPartConstructor('protocol');
const Domain = utils.getPartConstructor('domain');
const Port = utils.getPartConstructor('port');
const Path = utils.getPartConstructor('path');
const globalEventEmitter = new EventEmitter();
const emptyState = {};
let navigationKey = 0;

export const scrollStorage = {
    items: {},

    setItem: function (uri, pageYOffset) {
        try {
            sessionStorage.setItem('BrowserReactRouter/Scroll~' + uri, pageYOffset);
        } catch (error) {
            this.items[uri] = pageYOffset;
        }
    },

    getItem: function (uri) {
        try {
            return +sessionStorage.getItem('BrowserReactRouter/Scroll~' + uri) || 0;
        } catch (error) {
            return this.items[uri];
        }
    }
};

function emit (type, reason, data) {
    globalEventEmitter.emit(type, Object.assign({
        type,
        reason,
        navigationKey
    }, data));
}

globalEventEmitter.setMaxListeners(1000);

window.addEventListener('popstate', (nativeEvent) => {
    navigationKey++;
    const reason = 'popstate';
    const data = {
        uri: location.href,
        nativeEvent
    };
    emit(reason, reason, data);
    emit('change', reason, data);
});

export const pushUri = (uri) => {
    navigationKey++;
    history.pushState(emptyState, document.title, uri);
    const reason = 'pushstate';
    const data = {uri};
    emit(reason, reason, data);
    emit('change', reason, data);
};

export const replaceUri = (uri) => {
    navigationKey++;
    history.replaceState(emptyState, document.title, uri);
    const reason = 'replacestate';
    const data = {uri};
    emit(reason, reason, data);
    emit('change', reason, data);
};

export const back = () => {
    history.back();
};

export const forward = () => {
    history.forward();
};

export const go = (step) => {
    history.go(step);
};

export default class BrowserRussianRouter extends RussianRouter {
    constructor (rawRoutes, rawOptions) {
        super(...arguments);
        this._mapKeyToString = this._mapKeyToString.bind(this);
        this._onUriChange = this._onUriChange.bind(this);
        this.addListener('change', this._onUriChange);
        this._onUriChange({reason: 'popstate'});

        rawOptions = rawOptions || {};
        let scrollRestoration = (rawOptions.scrollRestoration + '').toLowerCase();
        if (availableScrollRestorations.indexOf(scrollRestoration) === -1) {
            scrollRestoration = 'manual'
        }
        this._parsedOptions.scrollRestoration = scrollRestoration;
        if (scrollRestoration !== 'manual') {
            if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
            }
        }
        if (scrollRestoration === 'auto') {
            this._onWindowScroll = this._onWindowScroll.bind(this);
            window.addEventListener('scroll', this._onWindowScroll);
        }
    }

    destructor () {
        super.destructor(...arguments);
        this.removeListener('change', this._onUriChange);
    }

    resolveUri (rawUri) {
        const splittedUri = utils.splitUri(rawUri, utils.getRegExp('uri'));
        const path = new Path(splittedUri.path);
        if (splittedUri.protocol || splittedUri.domain || splittedUri.port || path.isAbsolute()) {
            return rawUri;
        } else {
            let absoluteUri = location.pathname;
            const isPathEmpty = !path.toString();
            if (!isPathEmpty) {
                absoluteUri = location.pathname.replace(/\/$/, '') + '/' + path.toString();
            }
            if (splittedUri.query) {
                absoluteUri += '?' + splittedUri.query;
            } else if (isPathEmpty) {
                absoluteUri += location.search;
            }
            if (splittedUri.hash) {
                absoluteUri += '#' + splittedUri.hash;
            }
            return absoluteUri;
        }
    }

    matchUri (rawUri, ...restArguments) {
        return super
            .matchUri(this.resolveUri(rawUri), ...restArguments)
            .map(this._mapKeyToString);
    }

    generateUri () {
        return this.resolveUri(super.generateUri(...arguments));
    }

    getDefaultPart (partName) {
        const protocol = location.protocol.replace(/:$/, '').toLowerCase();
        switch (partName) {
            case 'protocol':
                return new Protocol(protocol);
            case 'domain':
                return new Domain(location.hostname);
            case 'port':
                return new Port(+location.port || utils.getPortByProtocol(protocol));
            default:
                return super.getDefaultPart(...arguments);
        }
    }

    getMatchObjects () {
        return this._matchObjects;
    }

    getNavigationKey () {
        return navigationKey;
    }

    addListener () {
        globalEventEmitter.addListener(...arguments);
    }

    removeListener () {
        globalEventEmitter.removeListener(...arguments);
    }

    pushUri (rawUri) {
        pushUri(rawUri);
    }

    replaceUri (rawUri) {
        replaceUri(rawUri);
    }

    pushRoute (routeName, userParams) {
        const rawUri = this.generateUri(routeName, userParams);
        pushUri(rawUri);
    }

    replaceRoute (routeName, userParams) {
        const rawUri = this.generateUri(routeName, userParams);
        replaceUri(rawUri);
    }

    back () {
        back();
    }

    forward () {
        forward();
    }

    go (step) {
        go(step);
    }

    restoreScroll () {
        const {scrollRestoration} = this._parsedOptions;
        if (scrollRestoration === 'reset') {
            window.scrollTo(0, 0);
        }

        if (scrollRestoration !== 'auto') {
            return;
        }
        if (this._lastEventType === 'popstate') {
            const pageYOffset = scrollStorage.getItem(location.href);
            window.scrollTo(0, pageYOffset);
        } else {
            window.scrollTo(0, 0);
            scrollStorage.setItem(location.href, 0);
        }
    }

    _mapKeyToString (matchObject) {
        return Object.assign({}, matchObject, {
            key: this._extractKey(matchObject)
        });
    }

    _extractKey (matchObject) {
        if (typeof matchObject.key === 'function') {
            return 'User/' + matchObject.key(matchObject, navigationKey);
        } else if (matchObject.key) {
            return ('User/' + matchObject.key).replace(/{key}/g, navigationKey);
        } else {
            return 'RussianRouter/' + matchObject.name;
        }
    }

    _onWindowScroll () {
        scrollStorage.setItem(location.href, window.pageYOffset);
    }

    _onUriChange (event) {
        const matchObjects = this.matchUri(location.href);
        this._matchObjects = matchObjects;
        this._lastEventType = event.reason;
    }
}

export {BrowserRussianRouter};
