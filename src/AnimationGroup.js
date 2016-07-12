import { Component, node, IS_DEBUG } from 'vidom';
import { childrenToArray, checkChildrenKeys, collectChildrenKeys, mergeChildren } from './utils';

export default class AnimationGroup extends Component {
    onInit() {
        this._appearingKeys = {};
        this._enteringKeys = {};
        this._leavingKeys = {};
        this._keysToEnter = null;
        this._keysToLeave = null;
    }

    onInitialStateRequest(_, children) {
        children = childrenToArray(children);

        if(IS_DEBUG) {
            checkChildrenKeys(children);
        }

        return { children };
    }

    onRender() {
        return node('fragment').children(this.getState().children);
    }

    onMount({ onAppear }) {
        if(onAppear) {
            this.getState().children.forEach(child => {
                const key = child._key;

                this._appearingKeys[key] = onAppear(child.getDomNode(), () => {
                    this._onAppeared(key);
                }) || noop
            });
        }
    }

    onAttrsReceive(nextAttrs, prevAttrs, nextChildren) {
        nextChildren = childrenToArray(nextChildren);

        if(IS_DEBUG) {
            checkChildrenKeys(nextChildren);
        }

        const { children } = this.getState(),
            nextKeys = collectChildrenKeys(nextChildren),
            currentKeys = collectChildrenKeys(children);

        children.forEach(child => {
            const key = child._key;

            if(!nextKeys[key] && !this._leavingKeys[key]) {
                (this._keysToLeave || (this._keysToLeave = {}))[key] = true;
            }
        });

        nextChildren.forEach(child => {
            const key = child._key;

            if(!currentKeys[key] || this._leavingKeys[key]) {
                (this._keysToEnter || (this._keysToEnter = {}))[key] = true;
            }
        });

        this.setState({ children : mergeChildren(children, nextChildren, nextKeys) });
    }

    onUpdate(attrs) {
        if(!this._keysToEnter && !this._keysToLeave) {
            return;
        }

        this.getState().children.forEach(child => {
            const key = child._key;

            if(this._keysToEnter && this._keysToEnter[key]) {
                if(this._leavingKeys[key]) {
                    this._leavingKeys[key]();
                    delete this._leavingKeys[key];
                }

                if(attrs.onEnter) {
                    this._enteringKeys = {
                        ...this._enteringKeys,
                        [key] : attrs.onEnter && attrs.onEnter(child.getDomNode(), () => {
                            this._onEntered(key);
                        }) || noop
                    };
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

                if(attrs.onLeave) {
                    this._leavingKeys = {
                        ...this._leavingKeys,
                        [key] : attrs.onLeave(child.getDomNode(), () => {
                            this._onLeft(key);
                        }) || noop
                    };
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
        this.setState({ children : this.getState().children.filter(child => child._key !== key) });
    }
}

function noop() {}
