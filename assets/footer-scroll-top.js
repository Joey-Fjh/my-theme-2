import { define } from 'alpine-adapter';
import Utils from 'utils';

define('footerScrollTop', () => ({
    scrollToTop() {
        Utils.scrollToTop();
    },
}));
