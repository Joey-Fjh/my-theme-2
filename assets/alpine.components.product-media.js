import { useDisposable } from 'utils';
import ThemeEvents from 'events';
import Utils from 'utils';

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

    imageMagnifier({
        scale = 2,
        previewMode = 'magnify',
        previewWidth = 0,
        previewHeight = 0,
        previewMaxWidth = 560,
        previewGap = 12,
    } = {}) {
        return {
            ...useDisposable(),
            active: false,
            imageReady: false,
            previewFrameStyle: '',
            previewImageStyle: '',
            scale: Math.max(1, Number(scale) || 2),
            previewMode,
            previewWidth: Math.max(0, Number(previewWidth) || 0),
            previewHeight: Math.max(0, Number(previewHeight) || 0),
            previewMaxWidth: Math.max(240, Number(previewMaxWidth) || 560),
            previewGap: Math.max(0, Number(previewGap) || 12),
            zoomImage: '',
            zoomImageLoaded: false,
            disabled: false,
            _frame: 0,
            _isHovering: false,
            _preloadPromise: null,
            _pointer: null,

            init() {
                this.scale = Math.max(1, Number(this.$el.dataset.zoomScale) || this.scale);
                this.previewMode = this.$el.dataset.previewMode || this.previewMode;
                this.previewWidth = this._readPositiveNumber(
                    this.$el.dataset.previewWidth,
                    this.previewWidth,
                );
                this.previewHeight = this._readPositiveNumber(
                    this.$el.dataset.previewHeight,
                    this.previewHeight,
                );
                this.previewMaxWidth =
                    Math.max(240, Number(this.$el.dataset.previewMaxWidth)) || this.previewMaxWidth;
                this.previewGap =
                    Math.max(0, Number(this.$el.dataset.previewGap)) || this.previewGap;
                this.zoomImage = this.$el.dataset.zoomImage || '';
                this.disabled = this._detectTouch();
            },

            openMagnifier(event) {
                if (this.disabled || !this._isMousePointer(event)) return;
                this._isHovering = true;
                this.imageReady = this.zoomImageLoaded;
                this.moveMagnifier(event);
                if (this._syncPreview()) {
                    this.active = true;
                }
                this._preloadZoomImage().then(() => {
                    if (!this._isHovering) return;
                    this._syncPreview();
                    this.imageReady = true;
                });
            },

            moveMagnifier(event) {
                if (this.disabled || !this._isMousePointer(event)) return;
                this._pointer = {
                    x: event.clientX,
                    y: event.clientY,
                    target: event.currentTarget,
                };

                if (this._frame) return;
                this._frame = requestAnimationFrame(() => {
                    this._frame = 0;
                    this._syncPreview();
                });
            },

            closeMagnifier() {
                this.active = false;
                this._isHovering = false;
                this._pointer = null;
            },

            _syncPreview() {
                if (!this._pointer?.target || !this.zoomImage) return false;

                const rect = this._pointer.target.getBoundingClientRect();
                const x = this._clamp((this._pointer.x - rect.left) / rect.width, 0, 1);
                const y = this._clamp((this._pointer.y - rect.top) / rect.height, 0, 1);
                const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
                const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
                const width = this.previewWidth
                    ? Math.min(this.previewWidth, viewportWidth - this.previewGap * 2)
                    : Math.min(this.previewMaxWidth, viewportWidth * 0.45);
                const height = this.previewHeight
                    ? Math.min(this.previewHeight, viewportHeight - this.previewGap * 2)
                    : Math.min(rect.height, viewportHeight - this.previewGap * 2);
                const canPlaceRight = rect.right + this.previewGap + width <= viewportWidth;
                const left = canPlaceRight
                    ? rect.right + this.previewGap
                    : Math.max(this.previewGap, rect.left - this.previewGap - width);
                const top = this._clamp(
                    rect.top,
                    this.previewGap,
                    Math.max(this.previewGap, viewportHeight - height - this.previewGap),
                );
                const safeUrl = String(this.zoomImage).replace(/"/g, '\\"');
                const frameStyles = [
                    `position: fixed`,
                    `left: ${Math.round(left)}px`,
                    `top: ${Math.round(top)}px`,
                    `width: ${Math.round(width)}px`,
                    `height: ${Math.round(height)}px`,
                    `--image-magnifier-position: ${x * 100}% ${y * 100}%`,
                ];
                const imageStyles = [
                    `background-image: url("${safeUrl}")`,
                    `background-repeat: no-repeat`,
                ];

                if (this.previewMode === 'contain') {
                    imageStyles.push('background-position: center');
                    imageStyles.push('background-size: contain');
                } else {
                    imageStyles.push('background-position: var(--image-magnifier-position)');
                    imageStyles.push(`background-size: ${this.scale * 100}%`);
                }

                this.previewFrameStyle = frameStyles.join(';');
                this.previewImageStyle = imageStyles.join(';');
                return true;
            },

            _preloadZoomImage() {
                if (this.zoomImageLoaded) return Promise.resolve();
                if (this._preloadPromise) return this._preloadPromise;

                this._preloadPromise = new Promise((resolve) => {
                    if (!this.zoomImage) {
                        resolve();
                        return;
                    }

                    const image = new Image();
                    image.onload = () => {
                        const decode = image.decode?.();
                        if (decode?.then) {
                            decode
                                .catch(() => {})
                                .finally(() => {
                                    this.zoomImageLoaded = true;
                                    resolve();
                                });
                            return;
                        }

                        this.zoomImageLoaded = true;
                        resolve();
                    };
                    image.onerror = () => {
                        this.zoomImageLoaded = true;
                        resolve();
                    };
                    image.src = this.zoomImage;
                });

                return this._preloadPromise;
            },

            _detectTouch() {
                if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
                    return false;
                }
                return window.matchMedia('(hover: none), (pointer: coarse)').matches;
            },

            _isMousePointer(event) {
                return !event?.pointerType || event.pointerType === 'mouse';
            },

            _clamp(value, min, max) {
                return Math.min(Math.max(value, min), max);
            },

            _readPositiveNumber(value, fallback = 0) {
                const number = Number(value);
                return Number.isFinite(number) && number > 0 ? number : fallback;
            },

            destroy() {
                if (this._frame) cancelAnimationFrame(this._frame);
                this.dispose();
            },
        };
    },

    beforeAfterComparison() {
        return {
            ...useDisposable(),
            position: 0,
            isDragging: false,
            _animateFrame: null,

            init() {
                if (!this._shouldAnimateSweep()) {
                    this.position = 50;
                }

                this.on(document, 'mouseup', () => this.endDrag());
                this.on(document, 'touchend', () => this.endDrag());
                this.on(document, 'mousemove', (e) => {
                    if (this.isDragging) this.updatePosition(e);
                });
                this.on(
                    document,
                    'touchmove',
                    (e) => {
                        if (this.isDragging) this.updatePosition(e);
                    },
                    { passive: true },
                );
            },

            _prefersReducedMotion() {
                if (typeof Utils?.prefersReducedMotion === 'function') {
                    return Utils.prefersReducedMotion();
                }
                return (
                    typeof window.matchMedia === 'function' &&
                    window.matchMedia('(prefers-reduced-motion: reduce)').matches
                );
            },

            _shouldAnimateSweep() {
                return (
                    document.body?.dataset?.motionEnabled !== 'false' &&
                    !this._prefersReducedMotion()
                );
            },

            _cancelSweep() {
                if (!this._animateFrame) return;
                cancelAnimationFrame(this._animateFrame);
                this._animateFrame = null;
            },

            animateToCenter() {
                this._cancelSweep();

                if (!this._shouldAnimateSweep()) {
                    this.position = 50;
                    return;
                }

                const start = 0;
                const end = 50;
                const duration = 800;
                const startTime = performance.now();
                this.position = start;

                const animate = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease out cubic
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    this.position = start + (end - start) * easeOut;

                    if (progress < 1) {
                        this._animateFrame = requestAnimationFrame(animate);
                    } else {
                        this._animateFrame = null;
                    }
                };

                this._animateFrame = requestAnimationFrame(animate);
            },

            startDrag(e) {
                this._cancelSweep();
                this.isDragging = true;
                this.updatePosition(e);
            },

            onDrag(e) {
                if (!this.isDragging) return;
                this.updatePosition(e);
            },

            endDrag() {
                this.isDragging = false;
            },

            handleKeydown(e) {
                this._cancelSweep();
                const step = 5;
                let handled = true;

                switch (e.key) {
                    case 'ArrowLeft':
                    case 'ArrowDown':
                        this.position = Math.max(0, this.position - step);
                        break;
                    case 'ArrowRight':
                    case 'ArrowUp':
                        this.position = Math.min(100, this.position + step);
                        break;
                    case 'Home':
                        this.position = 0;
                        break;
                    case 'End':
                        this.position = 100;
                        break;
                    default:
                        handled = false;
                }

                if (handled) e.preventDefault();
            },

            updatePosition(e) {
                const container = this.$refs?.container;
                if (!container) return;

                const rect = container.getBoundingClientRect();
                if (!rect || rect.width <= 0) return;

                const clientX = e.type.includes('touch')
                    ? (e.touches?.[0]?.clientX ?? e.changedTouches?.[0]?.clientX)
                    : e.clientX;

                if (clientX == undefined) return;

                const x = clientX - rect.left;
                const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

                this.position = percentage;
            },

            destroy() {
                this._cancelSweep();
                this.dispose();
            },
        };
    },

    mediaVideo() {
        return {
            ...useDisposable(),
            isPlaying: false,
            isMuted: true,
            hasPlayed: false,
            _videoCleanups: [],

            init() {
                const videos = this._getAllVideos();
                if (!videos.length) return;

                const visible = this._getVideo();
                if (visible) {
                    this.isMuted = visible.muted;
                    this.isPlaying = !visible.paused;
                }

                const onPlay = () => {
                    const shouldMoveFocus = document.activeElement === this.$refs?.playButton;
                    const current = this._getVideo();
                    if (current && !current.paused) {
                        this.isPlaying = true;
                        this.hasPlayed = true;
                        if (shouldMoveFocus) {
                            this.$nextTick(() => this._focusPlaybackControl('pauseButton'));
                        }
                    }
                };
                const onPause = () => {
                    const shouldMoveFocus = document.activeElement === this.$refs?.pauseButton;
                    const current = this._getVideo();
                    if (current && current.paused) {
                        this.isPlaying = false;
                        if (shouldMoveFocus) {
                            this.$nextTick(() => this._focusPlaybackControl('playButton'));
                        }
                    }
                };
                const onVolumeChange = () => {
                    const current = this._getVideo();
                    if (current) {
                        this.isMuted = current.muted;
                    }
                };

                videos.forEach((video) => {
                    video.addEventListener('play', onPlay);
                    video.addEventListener('pause', onPause);
                    video.addEventListener('volumechange', onVolumeChange);
                });

                this._videoCleanups.push(() => {
                    videos.forEach((video) => {
                        video.removeEventListener('play', onPlay);
                        video.removeEventListener('pause', onPause);
                        video.removeEventListener('volumechange', onVolumeChange);
                    });
                });
            },

            _getAllVideos() {
                const el = this.$el;
                if (!el) return [];
                return Array.from(el.querySelectorAll('video'));
            },

            _getVideo() {
                const el = this.$el;
                if (!el) return null;
                const desktop = el.querySelector('[data-video-desktop]');
                const mobile = el.querySelector('[data-video-mobile]');
                const desktopVideo = desktop?.querySelector('video');
                const mobileVideo = mobile?.querySelector('video');
                if (mobileVideo && mobile.offsetParent !== null) return mobileVideo;
                if (desktopVideo && desktop.offsetParent !== null) return desktopVideo;
                return desktopVideo || mobileVideo || el.querySelector('video');
            },

            _pauseOthers(currentVideo) {
                const videos = this._getAllVideos();
                videos.forEach((v) => {
                    if (v !== currentVideo && !v.paused) v.pause();
                });
            },

            _focusPlaybackControl(refName) {
                const control = this.$refs?.[refName];
                if (!(control instanceof HTMLElement)) return;

                control.focus({ preventScroll: true });
            },

            play() {
                const video = this._getVideo();
                if (video) {
                    this._pauseOthers(video);
                    video.play().catch(() => {});
                }
            },

            pause() {
                const video = this._getVideo();
                if (video) {
                    video.pause();
                }
            },

            toggleMute() {
                const video = this._getVideo();
                if (video) {
                    video.muted = !video.muted;
                    this.isMuted = video.muted;
                }
            },

            destroy() {
                this._videoCleanups.forEach((fn) => fn());
                this._videoCleanups = [];
                const videos = this._getAllVideos();
                videos.forEach((v) => {
                    if (!v.paused) v.pause();
                });
                this.dispose();
            },
        };
    },
};

export const {
    productGallery,
    imageMagnifier,
    beforeAfterComparison,
    mediaVideo,
} = components;
