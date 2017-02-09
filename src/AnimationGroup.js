import { Component, node, IS_DEBUG } from 'vidom';
import { childrenToArray, checkChildrenKeys, collectChildrenKeys, mergeChildren } from './utils';

export default class AnimationGroup extends Component {
    onInit() {
        this._appearingKeys = {};
        this._enteringKeys = {};
        this._leavingKeys = {};
        this._keysToEnter = null;
        this._keysToLeave = null;

        const children = childrenToArray(this.children);

        if(IS_DEBUG) {
            checkChildrenKeys(children);
        }

        this.setState({ children });
    }

    onRender() {
        return node('fragment').setChildren(this.state.children);
    }

    onMount() {
        const { onAppear } = this.attrs;

        if(onAppear) {
            this.state.children.forEach(child => {
                const { key } = child;

                this._appearingKeys[key] = onAppear(child.getDomNode(), () => {
                    this._onAppeared(key);
                }) || noOp
            });
        }
    }

    onChildrenChange() {
        const nextChildren = childrenToArray(this.children);

        if(IS_DEBUG) {
            checkChildrenKeys(nextChildren);
        }

        const { children } = this.state,
            nextKeys = collectChildrenKeys(nextChildren),
            currentKeys = collectChildrenKeys(children);

        children.forEach(child => {
            const { key } = child;

            if(!nextKeys[key] && !this._leavingKeys[key]) {
                (this._keysToLeave || (this._keysToLeave = {}))[key] = true;
            }
        });

        nextChildren.forEach(child => {
            const { key } = child;

            if(!currentKeys[key] || this._leavingKeys[key]) {
                (this._keysToEnter || (this._keysToEnter = {}))[key] = true;
            }
        });

        this.setState({ children : mergeChildren(children, nextChildren, nextKeys) });
    }

    onUpdate() {
        if(!this._keysToEnter && !this._keysToLeave) {
            return;
        }

        const { onEnter, onLeave } = this.attrs;

        this.state.children.forEach(child => {
            const { key } = child;

            if(this._keysToEnter && this._keysToEnter[key]) {
                if(this._leavingKeys[key]) {
                    this._leavingKeys[key]();
                    delete this._leavingKeys[key];
                }

                if(onEnter) {
                    this._enteringKeys[key] = onEnter(child.getDomNode(), () => {
                        this._onEntered(key);
                    }) || noOp;
                }
            }
            else if(this._keysToLeave && this._keysToLeave[key]) {
                if(this._appearingKeys[key]) {
                    this._appearingKeys[key]();
                    delete this._appearingKeys[key];
                }
                else if(this._enteringKeys[key]) {
                    this._enteringKeys[key]();
                    delete this._enteringKeys[key];
                }

                if(onLeave) {
                    this._leavingKeys[key] = onLeave(child.getDomNode(), () => {
                        this._onLeft(key);
                    }) || noOp;
                }
                else {
                    this._removeChildByKey(key);
                }
            }
        });

        this._keysToEnter = null;
        this._keysToLeave = null;
    }

    _onAppeared(key) {
        delete this._appearingKeys[key];
    }

    _onEntered(key) {
        delete this._enteringKeys[key];
    }

    _onLeft(key) {
        if(this._leavingKeys[key]) {
            delete this._leavingKeys[key];
            this._removeChildByKey(key);
        }
    }

    _removeChildByKey(key) {
        this.setState({ children : this.state.children.filter(child => child.key !== key) });
    }
}

function noOp() {}
