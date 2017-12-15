import {
    BrowserRussianRouter
} from '../../../src/index.js';
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
