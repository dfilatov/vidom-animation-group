import { Component, mount } from 'vidom';
import { AnimationGroup } from '../src';

class App extends Component {
    onInit() {
        this.setState({
            list : [1, 2, 3, 4]
        });
    }

    onRender() {
        return (
            <AnimationGroup
                onAppear={ this._onItemAppear }
                onEnter={ this._onItemEnter }
                onLeave={ this._onItemLeave }
            >
                { this.state.list.map(i => <div class="item" key={ i }>{ i }</div>) }
            </AnimationGroup>
        );
    }

    _onItemAppear(domNode, onAppeared) {
        return buildTransition(domNode, 'item_appear-from', 'item_appear-to', onAppeared);
    }

    _onItemEnter(domNode, onEntered) {
        return buildTransition(domNode, 'item_enter-from', 'item_enter-to', onEntered);
    }

    _onItemLeave(domNode, onLeft) {
        return buildTransition(domNode, 'item_leave-from', 'item_leave-to', onLeft);
    }

    onMount() {
        setTimeout(() => {
            this.setState({ list : [1, 2, 3] });
            setTimeout(() => {
                this.setState({ list : [2, 3, 4, 5, 6] });
            }, 500);
        }, 500);
    }
}

function buildTransition(domNode, classFrom, classTo, cb) {
    domNode.classList.add(classFrom);

    const onTransitionEnd = e => {
        if(e.target === domNode) {
            domNode.removeEventListener('transitionend', onTransitionEnd);
            domNode.classList.remove(classFrom, classTo);
            cb();
        }
    };

    requestAnimationFrame(() => {
        domNode.addEventListener('transitionend', onTransitionEnd, false);
        domNode.classList.add(classTo);
    });

    return () => {
        domNode.classList.remove(classFrom, classTo);
        domNode.removeEventListener('transitionend', onTransitionEnd);
        console.log('stop ' + classTo);
    };
}

const root = document.getElementById('root');

mount(root, <App/>);
