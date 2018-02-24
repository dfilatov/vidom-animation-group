import sinon from 'sinon';
import { mountSync, unmountSync, elem } from 'vidom';
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
            elem(
                AnimationGroup,
                null,
                { onAppear : spy },
                [
                    elem('div', 'a', { id : 'id1' }),
                    elem('div', 'b', { id : 'id2' })
                ]));

        expect(spy.calledTwice).to.be.ok();
        expect(spy.firstCall.calledWith(document.getElementById('id1'))).to.be.ok();
        expect(spy.secondCall.calledWith(document.getElementById('id2'))).to.be.ok();
    });

    it('should call onEnter callback with proper dom node for each new item', () => {
        const spy = sinon.spy();

        mountSync(
            domNode,
            elem(
                AnimationGroup,
                null,
                null,
                [
                    elem('div', 'a', { id : 'id1' }),
                    elem('div', 'c', { id : 'id3' })
                ]));

        mountSync(
            domNode,
            elem(
                AnimationGroup,
                null,
                { onEnter : spy },
                [
                    elem('div', 'a', { id : 'id1' }),
                    elem('div', 'b', { id : 'id2' }),
                    elem('div', 'c', { id : 'id3' }),
                    elem('div', 'd', { id : 'id4' })
                ]));

        expect(spy.calledTwice).to.be.ok();
        expect(spy.firstCall.calledWith(document.getElementById('id2'))).to.be.ok();
        expect(spy.secondCall.calledWith(document.getElementById('id4'))).to.be.ok();
    });

    it('should call onLeave callback with proper dom node for each new item', () => {
        const spy = sinon.spy();

        mountSync(
            domNode,
            elem(
                AnimationGroup,
                null,
                null,
                [
                    elem('div', 'a', { id : 'id1' }),
                    elem('div', 'b', { id : 'id2' }),
                    elem('div', 'c', { id : 'id3' }),
                    elem('div', 'd', { id : 'id4' })
                ]));

        mountSync(
            domNode,
            elem(
                AnimationGroup,
                null,
                { onLeave : spy },
                [
                    elem('div', 'a', { id : 'id1' }),
                    elem('div', 'c', { id : 'id3' })
                ]));

        expect(spy.calledTwice).to.be.ok();
        expect(spy.firstCall.calledWith(document.getElementById('id2'))).to.be.ok();
        expect(spy.secondCall.calledWith(document.getElementById('id4'))).to.be.ok();
    });

    it('should not call onLeave callback if item is already leaving', () => {
        const spy = sinon.spy();

        mountSync(
            domNode,
            elem(AnimationGroup, null, null, elem('div', 'a', { id : 'id1' })));

        mountSync(
            domNode,
            elem(AnimationGroup, null, { onLeave : spy }));

        mountSync(
            domNode,
            elem(AnimationGroup, null, { onLeave : spy }));

        expect(spy.calledOnce).to.be.ok();
    });

    it('should remove item after animation', done => {
        mountSync(
            domNode,
            elem(
                AnimationGroup,
                null,
                null,
                [
                    elem('div', 'a', { id : 'id1' }),
                    elem('div', 'b', { id : 'id2' }),
                    elem('div', 'c', { id : 'id3' })
                ]));

        mountSync(
            domNode,
            elem(
                AnimationGroup,
                null,
                { onLeave : (_, onLeft) => { setTimeout(onLeft, 30); } },
                [
                    elem('div', 'a', { id : 'id1' }),
                    elem('div', 'c', { id : 'id3' })
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
            elem(
                AnimationGroup,
                null,
                {
                    onAppear : (_, onAppeared) => {
                        setTimeout(onAppeared, 30);
                        return spy;
                    }
                },
                elem('div', 'a')));

        mountSync(domNode, elem(AnimationGroup));

        setTimeout(() => {
            expect(spy.called).to.be.ok();
            done();
        }, 60);
    });

    it('should call stop callback if leaving causes during entering', done => {
        const spy = sinon.spy();

        mountSync(domNode, elem(AnimationGroup));

        mountSync(
            domNode,
            elem(
                AnimationGroup,
                null,
                {
                    onEnter : (_, onEntered) => {
                        setTimeout(onEntered, 30);
                        return spy;
                    }
                },
                elem('div', 'a')));

        mountSync(domNode, elem(AnimationGroup));

        setTimeout(() => {
            expect(spy.called).to.be.ok();
            done();
        }, 60);
    });

    it('should call stop callback if entering causes during leaving', done => {
        const spy = sinon.spy();

        mountSync(
            domNode,
            elem(AnimationGroup, null, null, elem('div', 'a')));

        mountSync(
            domNode,
            elem(
                AnimationGroup,
                null,
                {
                    onLeave : (_, onLeft) => {
                        setTimeout(onLeft, 30);
                        return spy;
                    }
                }));

        mountSync(
            domNode,
            elem(
                AnimationGroup,
                null,
                null,
                elem('div', 'a')));

        setTimeout(() => {
            expect(spy.called).to.be.ok();
            done();
        }, 60);
    });
});
