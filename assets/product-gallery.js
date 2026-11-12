import { define } from 'alpine-adapter';
import { useDisposable } from 'utils';
import ThemeEvents from 'events';

define('productGallery', () => ({
    ...useDisposable(),
    _galleryRoot: null,
    _eventScope: null,

    init() {
        this._galleryRoot = this.$el;
        const Events = ThemeEvents;
        const events = Events.events;
        this._eventScope = Events.createScope();

        const onSlideToRequest = (e) => {
            const targetId = e.detail?.id;
            const galleryId = this._galleryRoot?.id || '';
            if (targetId) {
                if (targetId !== galleryId) return;
            } else if (galleryId) {
                return;
            }
            // The gallery is a grid, so a slide-to request only stops media that is playing.
            if (typeof e.detail?.index === 'number') this._pauseActiveVideo();
        };

        this._eventScope.on(events.PRODUCT_GALLERY_SLIDE_TO_REQUEST, onSlideToRequest);
    },

    _pauseActiveVideo() {
        this._galleryRoot?.querySelectorAll('video').forEach((video) => {
            if (!video.paused) video.pause();
        });
    },

    destroy() {
        this._eventScope?.dispose?.();
        this._eventScope = null;
        this._galleryRoot = null;
        this.dispose();
    },
}));
