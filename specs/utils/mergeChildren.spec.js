import { node } from 'vidom';
import { collectChildrenKeys, mergeChildren } from '../../src/utils';

describe('mergeChildren', () => {
    it('should properly merge non-empty current and non-empty next children', () => {
        const currentChildren = [
                node('div').key('c'),
                node('div').key('d'),
                node('div').key('e'),
                node('div').key('g'),
                node('div').key('h')
            ],
            nextChildren = [
                node('span').key('a'),
                node('span').key('b'),
                node('span').key('e'),
                node('span').key('f')
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
                node('span').key('a'),
                node('span').key('b')
            ];

        expect(mergeChildren(currentChildren, nextChildren, collectChildrenKeys(nextChildren)))
            .to.equal(nextChildren);
    });

    it('should properly merge non-empty current and empty next children', () => {
        const currentChildren = [
                node('div').key('a'),
                node('div').key('b')
            ],
            nextChildren = [];

        expect(mergeChildren(currentChildren, nextChildren, collectChildrenKeys(nextChildren)))
            .to.equal(currentChildren);
    });
});
