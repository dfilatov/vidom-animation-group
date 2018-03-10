import { console } from 'vidom';

export function checkChildrenKeys(children) {
    children.forEach(child => {
        if(child.key == null) {
            console.error('You must specify a key for each child of AnimationGroup.')
        }
    });
}

export function collectChildrenKeys(children) {
    return children.reduce((res, child) => {
        res[child.key] = child;
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
        if(nextKeys[child.key]) {
            if(pendingChildren.length) {
                nextChildrenPending[child.key] = pendingChildren;
                pendingChildren = [];
            }
        }
        else {
            pendingChildren.push(child);
        }
    });

    return nextChildren
        .reduce((res, child) => {
            if(nextChildrenPending[child.key]) {
                res = res.concat(nextChildrenPending[child.key]);
            }

            res.push(child);

            return res;
        }, [])
        .concat(pendingChildren);
}
