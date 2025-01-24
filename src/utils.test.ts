import { genUrls } from './utils';

describe('genUrls', () => {
    it('should generate a URL with the correct blob code', () => {
        const fn = () => console.log('test');
        const deps = ['https://example.com/dep1.js', 'https://example.com/dep2.js'];
        const transferable = true;

        const url = genUrls(fn, deps, transferable);
        expect(url).toContain('blob:');
    });

    it('should include the correct dependencies in the blob code', () => {
        const fn = () => console.log('test');
        const deps = ['https://example.com/dep1.js', 'https://example.com/dep2.js'];
        const transferable = true;

        const url = genUrls(fn, deps, transferable);
        const blob = new Blob([`
            importScripts('https://example.com/dep1.js','https://example.com/dep2.js');
            onmessage=(${fn.toString()})({
                fn: (${fn}),
                transferable: 'auto'
            })
        `], { type: 'text/javascript' });
        const expectedUrl = URL.createObjectURL(blob);

        expect(url).toBe(expectedUrl);
    });

    it('should handle empty dependencies', () => {
        const fn = () => console.log('test');
        const deps: string[] = [];
        const transferable = false;

        const url = genUrls(fn, deps, transferable);
        const blob = new Blob([`
            ;
            onmessage=(${fn.toString()})({
                fn: (${fn}),
                transferable: 'none'
            })
        `], { type: 'text/javascript' });
        const expectedUrl = URL.createObjectURL(blob);

        expect(url).toBe(expectedUrl);
    });
});