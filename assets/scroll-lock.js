let scrollLockCount = 0;
let scrollLockSnapshot = null;

export function lockScroll() {
    scrollLockCount += 1;
    if (scrollLockCount > 1) return;

    scrollLockSnapshot = {
        htmlOverflow: document.documentElement.style.overflow,
        bodyOverflow: document.body.style.overflow,
    };

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
}

export function unlockScroll() {
    if (scrollLockCount <= 0) return;

    scrollLockCount -= 1;
    if (scrollLockCount > 0 || !scrollLockSnapshot) return;

    document.documentElement.style.overflow = scrollLockSnapshot.htmlOverflow;
    document.body.style.overflow = scrollLockSnapshot.bodyOverflow;
    scrollLockSnapshot = null;
}
