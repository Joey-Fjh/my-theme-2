export function isElementVisible(el) {
    if (!(el instanceof Element)) return false;

    if (!el.offsetParent && el !== document.body) {
        let ancestor = el.parentElement;
        while (ancestor && ancestor !== document.body) {
            if (getComputedStyle(ancestor).display === 'none') return false;
            ancestor = ancestor.parentElement;
        }
    }

    return getComputedStyle(el).visibility !== 'hidden';
}
