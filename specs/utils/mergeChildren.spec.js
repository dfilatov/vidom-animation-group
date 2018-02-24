import { elem } from 'vidom';
import { collectChildrenKeys, mergeChildren } from '../../src/utils';

describe('mergeChildren', () => {
    it('should properly merge non-empty current and non-empty next children', () => {
        const currentChildren = [
                elem('div', 'c'),
                elem('div', 'd'),
                elem('div', 'e'),
                elem('div', 'g'),
                elem('div', 'h')
            ],
            nextChildren = [
                elem('span', 'a'),
                elem('span', 'b'),
                elem('span', 'e'),
                elem('span', 'f')
            ];

        expect(mergeChildren(currentChildren, nextChildren, collectChildrenKeys(nextChildren)))
            .to.eql([
                nextChildren[0],
                nextChildren[1],
                currentChildren[0],
                currentChildren[1],
                nextChildren[2],
                nextChildren[3],
                currentChildren[3],
                currentChildren[4]
            ]);
    });

    it('should properly merge empty current and non-empty next children', () => {
        const currentChildren = [],
            nextChildren = [
                elem('span', 'a'),
                elem('span', 'b')
            ];

        expect(mergeChildren(currentChildren, nextChildren, collectChildrenKeys(nextChildren)))
            .to.equal(nextChildren);
    });

    it('should properly merge non-empty current and empty next children', () => {
        const currentChildren = [
                elem('div', 'a'),
                elem('div', 'b')
            ],
            nextChildren = [];

        expect(mergeChildren(currentChildren, nextChildren, collectChildrenKeys(nextChildren)))
            .to.equal(currentChildren);
    });
});
