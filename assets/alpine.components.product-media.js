import { useDisposable } from 'utils';
import ThemeEvents from 'events';

const components = {
    productGallery() {
        return {
            ...useDisposable(),
            activeIndex: 0,
            mediaCount: 0,
            _galleryRoot: null,
            _thumbnailMediaQuery: null,
            _eventScope: null,

            init() {
                this._galleryRoot = this.$el;
                this.mediaCount = Number(this._galleryRoot.dataset.mediaCount) || 0;
                this._thumbnailMediaQuery = window.matchMedia('(min-width: 48rem)');
                this.on(this._thumbnailMediaQuery, 'change', () =>
                    this._syncThumbnailOrientation(),
                );
                this._syncThumbnailOrientation();
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
                    if (typeof e.detail?.index === 'number') this.setActive(e.detail.index);
                };

                this._eventScope.on(events.PRODUCT_GALLERY_SLIDE_TO_REQUEST, onSlideToRequest);
            },

            setActive(index) {
                if (this.mediaCount === 0) return;
                index = Math.max(0, Math.min(index, this.mediaCount - 1));
                this._pauseActiveVideo();
                this.activeIndex = index;
            },

            next() {
                this.setActive((this.activeIndex + 1) % this.mediaCount);
                this.$nextTick(() => this._revealActiveThumbnail());
            },

            prev() {
                this.setActive((this.activeIndex - 1 + this.mediaCount) % this.mediaCount);
                this.$nextTick(() => this._revealActiveThumbnail());
            },

            _pauseActiveVideo() {
                this._galleryRoot?.querySelectorAll('video').forEach((video) => {
                    if (!video.paused) video.pause();
                });
            },

            _revealActiveThumbnail() {
                const thumbnail = this._galleryRoot?.querySelector(
                    `[data-gallery-thumbnail="${this.activeIndex}"]`,
                );
                thumbnail?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            },

            _syncThumbnailOrientation() {
                const tablist = this._galleryRoot?.querySelector('[data-gallery-thumbnails]');
                if (!tablist) return;

                const desktopOrientation = tablist.dataset.desktopOrientation || 'horizontal';
                const orientation = this._thumbnailMediaQuery?.matches
                    ? desktopOrientation
                    : 'horizontal';

                tablist.setAttribute('aria-orientation', orientation);
            },

            _handleThumbnailKeydown(event) {
                const tablist = event.currentTarget;
                const orientation = tablist.getAttribute('aria-orientation') || 'horizontal';
                let nextIndex = null;

                switch (event.key) {
                    case 'ArrowRight':
                        if (orientation === 'horizontal') {
                            nextIndex = (this.activeIndex + 1) % this.mediaCount;
                        }
                        break;
                    case 'ArrowLeft':
                        if (orientation === 'horizontal') {
                            nextIndex = (this.activeIndex - 1 + this.mediaCount) % this.mediaCount;
                        }
                        break;
                    case 'ArrowDown':
                        if (orientation === 'vertical') {
                            nextIndex = (this.activeIndex + 1) % this.mediaCount;
                        }
                        break;
                    case 'ArrowUp':
                        if (orientation === 'vertical') {
                            nextIndex = (this.activeIndex - 1 + this.mediaCount) % this.mediaCount;
                        }
                        break;
                    case 'Home':
                        nextIndex = 0;
                        break;
                    case 'End':
                        nextIndex = this.mediaCount - 1;
                        break;
                }

                if (nextIndex === null) return;

                event.preventDefault();
                this.setActive(nextIndex);

                const nextThumb = tablist.querySelector(`[data-gallery-thumbnail="${nextIndex}"]`);
                if (nextThumb) nextThumb.focus();
            },

            destroy() {
                this._eventScope?.dispose?.();
                this._eventScope = null;
                this._thumbnailMediaQuery = null;
                this._galleryRoot = null;
                this.dispose();
            },
        };
    },
};

export const { productGallery } = components;
