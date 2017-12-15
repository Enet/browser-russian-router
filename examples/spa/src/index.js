import {
    BrowserRussianRouter,
    back,
    forward,
    pushUri,
    replaceUri
} from '../../../src/index.js';
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
