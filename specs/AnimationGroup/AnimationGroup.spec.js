import sinon from 'sinon';
import { mountSync, unmountSync, node } from 'vidom';
import AnimationGroup from '../../src/AnimationGroup';

describe('AnimationGroup', () => {
    let domNode;

    beforeEach(() => {
        document.body.appendChild(domNode = document.createElement('div'));
    });

    afterEach(() => {
        unmountSync(domNode);
        document.body.removeChild(domNode);
    });

    it('should call onAppear callback with proper dom node for each item after initial render', () => {
        const spy = sinon.spy();

        mountSync(
            domNode,
            node(AnimationGroup)
                .setAttrs({ onAppear : spy })
                .setChildren([
                    node('div').setKey('a').setAttrs({ id : 'id1' }),
                    node('div').setKey('b').setAttrs({ id : 'id2' })
                ]));

        expect(spy.calledTwice).to.be.ok();
        expect(spy.firstCall.calledWith(document.getElementById('id1'))).to.be.ok();
        expect(spy.secondCall.calledWith(document.getElementById('id2'))).to.be.ok();
    });

    it('should call onEnter callback with proper dom node for each new item', () => {
        const spy = sinon.spy();

        mountSync(
            domNode,
            node(AnimationGroup)
                .setChildren([
                    node('div').setKey('a').setAttrs({ id : 'id1' }),
                    node('div').setKey('c').setAttrs({ id : 'id3' })
                ]));

        mountSync(
            domNode,
            node(AnimationGroup)
                .setAttrs({ onEnter : spy })
                .setChildren([
                    node('div').setKey('a').setAttrs({ id : 'id1' }),
                    node('div').setKey('b').setAttrs({ id : 'id2' }),
                    node('div').setKey('c').setAttrs({ id : 'id3' }),
                    node('div').setKey('d').setAttrs({ id : 'id4' })
                ]));

        expect(spy.calledTwice).to.be.ok();
        expect(spy.firstCall.calledWith(document.getElementById('id2'))).to.be.ok();
        expect(spy.secondCall.calledWith(document.getElementById('id4'))).to.be.ok();
    });

    it('should call onLeave callback with proper dom node for each new item', () => {
        const spy = sinon.spy();

        mountSync(
            domNode,
            node(AnimationGroup)
                .setChildren([
                    node('div').setKey('a').setAttrs({ id : 'id1' }),
                    node('div').setKey('b').setAttrs({ id : 'id2' }),
                    node('div').setKey('c').setAttrs({ id : 'id3' }),
                    node('div').setKey('d').setAttrs({ id : 'id4' })
                ]));

        mountSync(
            domNode,
            node(AnimationGroup)
                .setAttrs({ onLeave : spy })
                .setChildren([
                    node('div').setKey('a').setAttrs({ id : 'id1' }),
                    node('div').setKey('c').setAttrs({ id : 'id3' })
                ]));

        expect(spy.calledTwice).to.be.ok();
        expect(spy.firstCall.calledWith(document.getElementById('id2'))).to.be.ok();
        expect(spy.secondCall.calledWith(document.getElementById('id4'))).to.be.ok();
    });

    it('should not call onLeave callback if item is already leaving', () => {
        const spy = sinon.spy();

        mountSync(
            domNode,
            node(AnimationGroup)
                .setChildren(node('div').setKey('a').setAttrs({ id : 'id1' })));

        mountSync(
            domNode,
            node(AnimationGroup)
                .setAttrs({ onLeave : spy }));

        mountSync(
            domNode,
            node(AnimationGroup)
                .setAttrs({ onLeave : spy }));

        expect(spy.calledOnce).to.be.ok();
    });

    it('should remove item after animation', done => {
        mountSync(
            domNode,
            node(AnimationGroup)
                .setChildren([
                    node('div').setKey('a').setAttrs({ id : 'id1' }),
                    node('div').setKey('b').setAttrs({ id : 'id2' }),
                    node('div').setKey('c').setAttrs({ id : 'id3' })
                ]));

        mountSync(
            domNode,
            node(AnimationGroup)
                .setAttrs({ onLeave : (_, onLeft) => { setTimeout(onLeft, 30); } })
                .setChildren([
                    node('div').setKey('a').setAttrs({ id : 'id1' }),
                    node('div').setKey('c').setAttrs({ id : 'id3' })
                ]));

        const domNodeToRemove = document.getElementById('id2');

        expect(domNodeToRemove.parentNode).to.be.equal(domNode);
        setTimeout(() => {
            expect(domNodeToRemove.parentNode).to.be.equal(null);
            done();
        }, 60);
    });

    it('should call stop callback if leaving causes during appearance', done => {
        const spy = sinon.spy();

        mountSync(
            domNode,
            node(AnimationGroup)
                .setAttrs({
                    onAppear : (_, onAppeared) => {
                        setTimeout(onAppeared, 30);
                        return spy;
                    }
                })
                .setChildren(node('div').setKey('a')));

        mountSync(
            domNode,
            node(AnimationGroup));

        setTimeout(() => {
            expect(spy.called).to.be.ok();
            done();
        }, 60);
    });

    it('should call stop callback if leaving causes during entering', done => {
        const spy = sinon.spy();

        mountSync(
            domNode,
            node(AnimationGroup));

        mountSync(
            domNode,
            node(AnimationGroup)
                .setAttrs({
                    onEnter : (_, onEntered) => {
                        setTimeout(onEntered, 30);
                        return spy;
                    }
                })
                .setChildren(node('div').setKey('a')));

        mountSync(
            domNode,
            node(AnimationGroup));

        setTimeout(() => {
            expect(spy.called).to.be.ok();
            done();
        }, 60);
    });

    it('should call stop callback if entering causes during leaving', done => {
        const spy = sinon.spy();

        mountSync(
            domNode,
            node(AnimationGroup)
                .setChildren(node('div').setKey('a')));

        mountSync(
            domNode,
            node(AnimationGroup)
                .setAttrs({
                    onLeave : (_, onLeft) => {
                        setTimeout(onLeft, 30);
                        return spy;
                    }
                }));

        mountSync(
            domNode,
            node(AnimationGroup)
                .setChildren(node('div').setKey('a')));

        setTimeout(() => {
            expect(spy.called).to.be.ok();
            done();
        }, 60);
    });
});
