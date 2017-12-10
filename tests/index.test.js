import BrowserRussianRouter from '../src/index.js';

const routes = {
    index: {
        uri: 'http://localhost/hello/{name}/',
        params: {
            name: ['world', 'people']
        }
    }
};
const options = {};
const router = new BrowserRussianRouter(routes, options);

// Test coverage is about 100 percents
test('Router generates uri', () => {
    expect(router.generateUri('index')).toBe('http://localhost/hello/world/');
    expect(router.generateUri('index', {name: 'people'})).toBe('http://localhost/hello/people/');
});

test('Router matches uri', () => {
    expect(router.matchUri('http://localhost/hello/world/').length).toBe(1);
    expect(router.matchUri('http://localhost/hello/people/').length).toBe(1);
    expect(router.matchUri('http://localhost/hello/there/').length).toBe(0);
    expect(router.matchUri('http://localhost/hello/world/')[0].params.name).toBe('world');
    expect(router.matchUri('http://localhost/hello/people/')[0].params.name).toBe('people');
});
