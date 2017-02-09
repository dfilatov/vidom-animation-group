import { node } from 'vidom';
import { collectChildrenKeys, mergeChildren } from '../../src/utils';

describe('mergeChildren', () => {
    it('should properly merge non-empty current and non-empty next children', () => {
        const currentChildren = [
                node('div').setKey('c'),
                node('div').setKey('d'),
                node('div').setKey('e'),
                node('div').setKey('g'),
                node('div').setKey('h')
            ],
            nextChildren = [
                node('span').setKey('a'),
                node('span').setKey('b'),
                node('span').setKey('e'),
                node('span').setKey('f')
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
                node('span').setKey('a'),
                node('span').setKey('b')
            ];

        expect(mergeChildren(currentChildren, nextChildren, collectChildrenKeys(nextChildren)))
            .to.equal(nextChildren);
    });

    it('should properly merge non-empty current and empty next children', () => {
        const currentChildren = [
                node('div').setKey('a'),
                node('div').setKey('b')
            ],
            nextChildren = [];

        expect(mergeChildren(currentChildren, nextChildren, collectChildrenKeys(nextChildren)))
            .to.equal(currentChildren);
    });
});
