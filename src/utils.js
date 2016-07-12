import { console } from 'vidom';

export function childrenToArray(children) {
    return children?
        Array.isArray(children)? children : [children] :
        [];
}

export function checkChildrenKeys(children) {
    children.forEach(child => {
        if(child._key == null) {
            console.error('You must specify a key for each child of AnimationGroup.')
        }
    });
}

export function collectChildrenKeys(children) {
    return children.reduce((res, child) => {
        res[child._key] = child;
        return res;
    }, {});
}

export function mergeChildren(currentChildren, nextChildren, nextKeys) {
    if(!currentChildren.length) {
        return nextChildren;
    }

    if(!nextChildren.length) {
        return currentChildren;
    }

    const nextChildrenPending = {};
    let pendingChildren = [];

    currentChildren.forEach(child => {
        if(nextKeys[child._key]) {
            if(pendingChildren.length) {
                nextChildrenPending[child._key] = pendingChildren;
                pendingChildren = [];
            }
        }
        else {
            pendingChildren.push(child);
        }
    });

    return nextChildren
        .reduce((res, child) => {
            if(nextChildrenPending[child._key]) {
                res = res.concat(nextChildrenPending[child._key]);
            }

            res.push(child);

            return res;
        }, [])
        .concat(pendingChildren);
}
