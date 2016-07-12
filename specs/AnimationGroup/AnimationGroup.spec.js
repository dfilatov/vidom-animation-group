import sinon from 'sinon';
import { mountToDomSync, unmountFromDomSync, node } from 'vidom';
import AnimationGroup from '../../src/AnimationGroup';

describe('AnimationGroup', () => {
    let domNode;

    beforeEach(() => {
        document.body.appendChild(domNode = document.createElement('div'));
    });

    afterEach(() => {
        unmountFromDomSync(domNode);
        document.body.removeChild(domNode);
    });

    it('should call onAppear callback with proper dom node for each item after initial render', () => {
        const spy = sinon.spy();

        mountToDomSync(
            domNode,
            node(AnimationGroup)
                .attrs({ onAppear : spy })
                .children([
                    node('div').key('a').attrs({ id : 'id1' }),
                    node('div').key('b').attrs({ id : 'id2' })
                ]));

        expect(spy.calledTwice).to.be.ok();
        expect(spy.firstCall.calledWith(document.getElementById('id1'))).to.be.ok();
        expect(spy.secondCall.calledWith(document.getElementById('id2'))).to.be.ok();
    });

    it('should call onEnter callback with proper dom node for each new item', () => {
        const spy = sinon.spy();

        mountToDomSync(
            domNode,
            node(AnimationGroup)
                .children([
                    node('div').key('a').attrs({ id : 'id1' }),
                    node('div').key('c').attrs({ id : 'id3' })
                ]));

        mountToDomSync(
            domNode,
            node(AnimationGroup)
                .attrs({ onEnter : spy })
                .children([
                    node('div').key('a').attrs({ id : 'id1' }),
                    node('div').key('b').attrs({ id : 'id2' }),
                    node('div').key('c').attrs({ id : 'id3' }),
                    node('div').key('d').attrs({ id : 'id4' })
                ]));

        expect(spy.calledTwice).to.be.ok();
        expect(spy.firstCall.calledWith(document.getElementById('id2'))).to.be.ok();
        expect(spy.secondCall.calledWith(document.getElementById('id4'))).to.be.ok();
    });

    it('should call onLeave callback with proper dom node for each new item', () => {
        const spy = sinon.spy();

        mountToDomSync(
            domNode,
            node(AnimationGroup)
                .children([
                    node('div').key('a').attrs({ id : 'id1' }),
                    node('div').key('b').attrs({ id : 'id2' }),
                    node('div').key('c').attrs({ id : 'id3' }),
                    node('div').key('d').attrs({ id : 'id4' })
                ]));

        mountToDomSync(
            domNode,
            node(AnimationGroup)
                .attrs({ onLeave : spy })
                .children([
                    node('div').key('a').attrs({ id : 'id1' }),
                    node('div').key('c').attrs({ id : 'id3' })
                ]));

        expect(spy.calledTwice).to.be.ok();
        expect(spy.firstCall.calledWith(document.getElementById('id2'))).to.be.ok();
        expect(spy.secondCall.calledWith(document.getElementById('id4'))).to.be.ok();
    });

    it('should not call onLeave callback if item is already leaving', () => {
        const spy = sinon.spy();

        mountToDomSync(
            domNode,
            node(AnimationGroup)
                .children(node('div').key('a').attrs({ id : 'id1' })));

        mountToDomSync(
            domNode,
            node(AnimationGroup)
                .attrs({ onLeave : spy }));

        mountToDomSync(
            domNode,
            node(AnimationGroup)
                .attrs({ onLeave : spy }));

        expect(spy.calledOnce).to.be.ok();
    });

    it('should remove item after animation', done => {
        mountToDomSync(
            domNode,
            node(AnimationGroup)
                .children([
                    node('div').key('a').attrs({ id : 'id1' }),
                    node('div').key('b').attrs({ id : 'id2' }),
                    node('div').key('c').attrs({ id : 'id3' })
                ]));

        mountToDomSync(
            domNode,
            node(AnimationGroup)
                .attrs({ onLeave : (_, onLeft) => { setTimeout(onLeft, 30); } })
                .children([
                    node('div').key('a').attrs({ id : 'id1' }),
                    node('div').key('c').attrs({ id : 'id3' })
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

        mountToDomSync(
            domNode,
            node(AnimationGroup)
                .attrs({
                    onAppear : (_, onAppeared) => {
                        setTimeout(onAppeared, 30);
                        return spy;
                    }
                })
                .children(node('div').key('a')));

        mountToDomSync(
            domNode,
            node(AnimationGroup));

        setTimeout(() => {
            expect(spy.called).to.be.ok();
            done();
        }, 60);
    });

    it('should call stop callback if leaving causes during entering', done => {
        const spy = sinon.spy();

        mountToDomSync(
            domNode,
            node(AnimationGroup));

        mountToDomSync(
            domNode,
            node(AnimationGroup)
                .attrs({
                    onEnter : (_, onEntered) => {
                        setTimeout(onEntered, 30);
                        return spy;
                    }
                })
                .children(node('div').key('a')));

        mountToDomSync(
            domNode,
            node(AnimationGroup));

        setTimeout(() => {
            expect(spy.called).to.be.ok();
            done();
        }, 60);
    });

    it('should call stop callback if entering causes during leaving', done => {
        const spy = sinon.spy();

        mountToDomSync(
            domNode,
            node(AnimationGroup)
                .children(node('div').key('a')));

        mountToDomSync(
            domNode,
            node(AnimationGroup)
                .attrs({
                    onLeave : (_, onLeft) => {
                        setTimeout(onLeft, 30);
                        return spy;
                    }
                }));

        mountToDomSync(
            domNode,
            node(AnimationGroup)
                .children(node('div').key('a')));

        setTimeout(() => {
            expect(spy.called).to.be.ok();
            done();
        }, 60);
    });
});
