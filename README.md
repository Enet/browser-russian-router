# :ru: browser-russian-router :space_invader:

[![npm version](https://img.shields.io/npm/v/browser-russian-router.svg)](https://www.npmjs.com/package/browser-russian-router)
[![gzip size](http://img.badgesize.io/https://npmcdn.com/browser-russian-router/dist/browser-russian-router.min.js?compression=gzip)](https://npmcdn.com/browser-russian-router/dist/browser-russian-router.min.js?compression=gzip)
[![test coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](https://github.com/Enet/russian-router)
[![stepan zhevak](https://img.shields.io/badge/stepan-zhevak-1a8b8e.svg)](https://zhevak.name)

Here is the javascript router for browser environment based on [russian-router](https://github.com/Enet/russian-router).

- :tiger: [Installation](#tiger-installation)
- :monkey_face: [API](#monkey_face-api)
- :fox_face: [Examples](#fox_face-examples)
- :pig: [Contributors](#pig-contributors)

# :tiger: Installation
To install the current version with **npm** use the command below:
```sh
npm install --save browser-russian-router
```
Or if you prefer **yarn**:
```sh
yarn add browser-russian-router
```

Now the package is installed and you can start using it in different environments.

For **ES6** modules:
```javascript
import {BrowserRussianRouter} from 'browser-russian-router';
```

For **CommonJS** modules:
```javascript
const {BrowserRussianRouter} = require('browser-russian-router');
```

Or you can add **UMD** bundle just to your HTML code:
```html
<script src="browser-russian-router/dist/browser-russian-router.js"></script>
<!-- Minified version is available browser-russian-router/dist/browser-russian-router.min.js -->
```

# :monkey_face: API
Since browser-russian-router only extends capabilities of [russian-router](https://github.com/Enet/russian-router), it's strongly recommended to read original documentation before usage.

Browser router additionally works with the browser history. It pushes and replaces uris, emits events when uri is changed and even restores the scroll position. Also browser-russian-router substitutes keys in match objects. See examples section to learn how it works exactly.

Another important thing is methods `pushUri` and `replaceUri`, provided by browser-russian-router. You have to use them instead native analogues to inform the router about changes, because `pushState` and `replaceState` don't emit any events.

## `new BrowserRussianRouter(rawRoutes, rawOptions)`
Returns a new instance of `BrowserRussianRouter`. At the moment all the instances use the same global native history, but there is an intention to change it in the future.

Also one additional option appears. It's `scrollRestoration`, that can be set to one of the values `manual`, `auto` or `reset`. Not confuse it with native property `history.scrollRestoration`.
- Default value `manual` does nothing, scroll works as before. `history.scrollRestoration` isn't affected.
- If `auto` was chosen, the router handles scroll position. `history.scrollRestoration` is set to `manual`.
- If `reset` was chosen, the router resets scroll position, when uri is changed. `history.scrollRestoration` is set to `manual`.

## `router.destructor()`
Returns nothing, but must be called before router is deleted from the code. The method removes all the listeners. If you don't call destructor, your memory is leaking.

## `router.resolveUri(rawUri)`
Transforms any `rawUri` to uri, that has an absolute path. The result depends on the current location (uri from the addressbar).

## `router.matchUri(rawUri)`
Firstly resolves uri using `router.resolveUri`, then matches routes. So the method always matches uri, that has an absolute path.

## `router.generateUri(routeName, userParams)`
Firstly generates uri, then resolves it using `router.resolveUri`. Returns a uri (string), that has an absolute path.

## `router.getMatchObjects()`
Returns already cached array of match objects. The result depends on current location (uri from the addressbar).

> The router replaces a key property of match object. The original key could be presented by a function like `(matchObject) => matchObject.params.id` or by a string like `userPage:{key}` (key will be replaced to navigation key).

## `router.getNavigationKey()`
Returns current navigation key, that is changed every time, when navigation was occured (uri was changed).

## `router.addListener(eventType, eventHandler)`
Adds new event listener. The next event types are available: `pushstate`, `replacestate`, `popstate`, `change`.

## `router.removeListener(eventType, eventHandler)`
Removes event listener.

## `router.restoreScroll()`
Restores the scroll after uri was changed. It has no effect, if option `scrollRestoration` is `manual` (by default).

Note you need to call the method manually. It's because the router only knows that uri is changed, but absolutely has no idea when to update your application. [react-russian-router](https://github.com/Enet/react-russian-router) cares about scroll restoration and calls this method.

## `router.pushRoute(routeName, userParams)`
Generates uri and pushes it to the history.

## `router.replaceRoute(routeName, userParams)`
Generates uri and replaces the current state with it.

## `router.pushUri(rawUri)`
Alias for `pushUri`.

## `router.replaceUri(rawUri)`
Alias for `replaceUri`.

## `router.back()`
Alias for `back`.

## `router.forward()`
Alias for `forward`.

## `router.go(stepNumber)`
Alias for `go`.

## `pushUri(rawUri)`
Pushes uri to history like `history.pushState`. Also the method affects so called navigation key and emits an event. You have to use it instead native `pushState`.

## `replaceUri(rawUri)`
Replaces state with uri like `history.replaceState`. Also the method affects so called navigation key and emits an event. You have to use it instead native `replaceState`.

## `back()`
Alias for native `history.back`.

## `forward()`
Alias for native `history.forward`.

## `go(stepNumber)`
Alias for native `history.go`.

# :fox_face: Examples
Look at the examples how to use router in some cases. If you want to use [react](https://github.com/facebook/react), check out [react-russian-router](https://github.com/Enet/react-russian-router).

## Demo Example
<details><summary><strong>See examples/demo/src/routes.js</strong></summary>

```javascript
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
```
</details>
<details><summary><strong>See examples/demo/src/index.js</strong></summary>

```javascript
import {
    BrowserRussianRouter
} from 'browser-russian-router';
import routes from './routes.js';

// Reset the uri before the demonstration
history.replaceState({}, document.title, '/user/123?hello=world');

const options = {};
const router = new BrowserRussianRouter(routes, options);

const currentMatchObjects = router.getMatchObjects();
console.log(currentMatchObjects.length); // 1
console.log(currentMatchObjects[0].key); // 'User/user.123'

const indexMatchObjects = router.matchUri('/');
console.log(indexMatchObjects[0].key); // 'User/index.0'

const aboutMatchObjects = router.matchUri('/about');
console.log(aboutMatchObjects[0].key); // 'RussianRouter/about'

console.log(router.resolveUri('delete')); // '/user/123/delete'
console.log(router.resolveUri('?xyz=777')); // '/user/123?xyz=777'
console.log(router.resolveUri('#матрёшка')); // '/user/123#матрёшка'
console.log(router.resolveUri('?xyz=777#матрёшка')); // '/user/123?xyz=777#матрёшка'
console.log(router.resolveUri('/already/resolved/')); // '/alrady/resolved/'

const helloMatchObjects = router.matchUri('?hello=world');
console.log(helloMatchObjects.length); // 2
console.log(helloMatchObjects[0].name); // 'user'
console.log(helloMatchObjects[1].name); // 'hello'
console.log(helloMatchObjects[1].path); // '/user/123'
console.log(helloMatchObjects[1].query); // {hello: 'world'}
console.log(helloMatchObjects[1].params.entity); // 'world'

console.log(router.generateUri('about')); // '/about'
console.log(router.generateUri('hello', {entity: 'world'})); // '/user/123?hello=world'

console.log(router.getNavigationKey()); // 0
router.pushUri('/');
console.log(router.getNavigationKey()); // 1
```
</details>

## SPA Example
<details><summary><strong>See examples/spa/src/routes.js</strong></summary>

```javascript
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
```
</details>
<details><summary><strong>See examples/spa/src/index.js</strong></summary>

```javascript
import {
    BrowserRussianRouter,
    back,
    forward,
    pushUri,
    replaceUri
} from 'browser-russian-router';
import routes from './routes.js';

// Reset the uri before the demonstration
history.replaceState({}, document.title, '/');

const options = {
    scrollRestoration: 'auto'
};
const router = new BrowserRussianRouter(routes, options);

// Render JSON stringified match objects to container
const codeNode = document.getElementById('json');
function renderCode (matchObjects) {
    codeNode.innerHTML = JSON.stringify(matchObjects);
}

// Render the content of entry point, that is matched now
const contentNode = document.getElementById('content');
function renderContent (matchObjects) {
    const html = matchObjects.map((matchObject) => {
        if (matchObject.name === 'index') {
            return `<article class="index">
                Welcome to the index page! Sorry for CSS, the demo is for developers.
            </article>`;
        } else if (matchObject.name === 'user') {
            return `<article class="user">
                Here is information about user ${matchObject.params.id}.
            </article>`;
        } else {
            return `<article class="list">
                Here is list of filtered items.
                Filter's value is ${matchObject.query.filter}.
            </article>`;
        }
    });
    contentNode.innerHTML = html;
}

// Handler is called every time, when uri is changed
function onUriChange ({reason}) {
    console.log('URI was changed because ' + reason + ' occured!');

    const matchObjects = router.getMatchObjects();
    renderCode(matchObjects);
    renderContent(matchObjects);

    // Scroll should be restored manually after uri is changed
    router.restoreScroll();
}

// You can start/stop observing uri changes
let routingState = false;
const routingNode = document.getElementById('routing');
function onRoutingButtonClick () {
    routingState = !routingState;
    if (routingState) {
        routingNode.innerHTML = 'Stop routing';
        onUriChange({reason: 'startrouting'});
        router.addListener('change', onUriChange);
    } else {
        routingNode.innerHTML = 'Start routing';
        router.removeListener('change', onUriChange);
    }
}

// Click handler to prevent default link's action and implement SPA
function onLinkClick (event) {
    const linkNode = event.target;
    if (!linkNode || linkNode.tagName !== 'A') {
        return;
    }

    event.preventDefault();

    const fn = linkNode.getAttribute('data-fn');
    if (fn === 'back') {
        back(); // router.back is an alias
        return;
    } else if (fn === 'forward') {
        forward(); // router.forward is an alias
        return;
    }

    const action = linkNode.getAttribute('data-action');
    const name = linkNode.getAttribute('data-name');
    if (name) {
        const params = linkNode.onclick();
        if (action === 'replace') {
            router.replaceRoute(name, params);
        } else {
            router.pushRoute(name, params);
        }
        return;
    }

    const href = linkNode.getAttribute('href');
    if (action === 'replace') {
        replaceUri(href); // router.replaceUri is an alias
    } else {
        pushUri(href); // router.pushUri is an alias
    }
}

document.addEventListener('click', onLinkClick);
routingNode.addEventListener('click', onRoutingButtonClick);
onRoutingButtonClick();
```
</details>

# :pig: Contributors
Pull requests are welcome :feet: Let improve the package together. But, please, respect the code style.

If you don't understand how to use the router or you have additional questions about internal structure, be free to write me at [enet@protonmail.ch](enet@protonmail.ch). Also if you are looking for front-end software developer, be aware that I'm looking for a job. Check out my portfolio at [https://zhevak.name](https://zhevak.name) :baby_chick:
