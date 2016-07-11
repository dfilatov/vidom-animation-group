import { Component, node, IS_DEBUG } from 'vidom';
import { childrenToArray, checkChildrenKeys, collectChildrenKeys, mergeChildren } from './utils';

export default class AnimationGroup extends Component {
    onInit() {
        this._appearingKeys = {};
        this._addingKeys = {};
        this._removingKeys = {};
        this._keysToAdd = null;
        this._keysToRemove = null;
    }

    onInitialStateRequest(_, children) {
        if(IS_DEBUG) {
            checkChildrenKeys(children);
        }

        return { children : childrenToArray(children) };
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

            if(!nextKeys[key]) {
                (this._keysToRemove || (this._keysToRemove = {}))[key] = true;
            }
        });

        nextChildren.forEach(child => {
            const key = child._key;

            if(!currentKeys[key] || this._removingKeys[key]) {
                (this._keysToAdd || (this._keysToAdd = {}))[key] = true;
            }
        });

        this.setState({ children : mergeChildren(children, nextChildren, nextKeys) });
    }

    onUpdate(attrs) {
        if(!this._keysToAdd && !this._keysToRemove) {
            return;
        }

        this.getState().children.forEach(child => {
            const key = child._key;

            if(this._keysToAdd && this._keysToAdd[key]) {
                if(this._removingKeys[key]) {
                    this._removingKeys[key]();
                    delete this._removingKeys[key];
                }

                if(attrs.onEnter) {
                    this._addingKeys = {
                        ...this._addingKeys,
                        [key] : attrs.onEnter && attrs.onEnter(child.getDomNode(), () => {
                            this._onEntered(key);
                        }) || noop
                    };
                }
            }
            else if(this._keysToRemove && this._keysToRemove[key]) {
                if(this._appearingKeys[key]) {
                    this._appearingKeys[key]();
                    delete this._appearingKeys[key];
                }

                if(this._addingKeys[key]) {
                    this._addingKeys[key]();
                    delete this._addingKeys[key];
                }

                if(attrs.onLeave) {
                    this._removingKeys = {
                        ...this._removingKeys,
                        [key] : attrs.onLeave(child.getDomNode(), () => {
                            this._onLeft(key);
                        }) || noop
                    };
                }
            }
        });

        this._keysToAdd = null;
        this._keysToRemove = null;
    }

    _onAppeared(key) {
        // console.log('appeared', key);
        delete this._appearingKeys[key];
    }

    _onEntered(key) {
        // console.log('entered', key);
        delete this._addingKeys[key];
    }

    _onLeft(key) {
        if(this._removingKeys[key]) {
            // console.log('left', key);
            delete this._removingKeys[key];
            this.setState({ children : this.getState().children.filter(child => child._key !== key) });
        }
    }
}

function noop() {}
