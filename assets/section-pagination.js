import { define } from 'alpine-adapter';
import { useDisposable } from 'utils';
import Utils from 'utils';
import { ShopifyHttp, SectionRefresher } from 'https';

define('sectionPagination', () => ({
    ...useDisposable(),
    isLoading: false,
    sectionId: null,
    selectors: [],
    abortController: null,
    _debouncedFetch: null,

    _hydrateFromDataset() {
        const ds = this.$el?.dataset;
        if (!ds) return;
        if (!this.sectionId && ds.paginationSectionId) {
            this.sectionId = ds.paginationSectionId;
        }
        if (this.selectors.length === 0 && ds.paginationSelectors) {
            try {
                const parsed = JSON.parse(ds.paginationSelectors);
                if (Array.isArray(parsed)) this.selectors = parsed;
            } catch (_) {}
        }
    },

    init() {
        this._hydrateFromDataset();
        if (!this.sectionId) return;

        if (!window.history.state || !window.history.state.path) {
            window.history.replaceState({ path: window.location.href }, '', window.location.href);
        }

        if (Utils) {
            this._debouncedFetch = Utils.debounce((url) => this._executeFetch(url, true), 200);
        }
        if (this.on) {
            this.on(window, 'popstate', this.handlePopState.bind(this));
        }
    },

    buildDomMap() {
        const ids = Array.isArray(this.sectionId) ? this.sectionId : [this.sectionId];
        const perSection =
            !Array.isArray(this.selectors) && this.selectors && typeof this.selectors === 'object';
        const map = {};
        for (const id of ids) {
            const config = {
                targetSelector: `#shopify-section-${id}`,
            };
            const sels = perSection ? this.selectors[id] : this.selectors;
            if (Array.isArray(sels) && sels.length > 0) {
                config.innerSelectors = sels;
            }
            map[id] = config;
        }
        return map;
    },

    _executeFetch(url, updateHistory) {
        const Http = ShopifyHttp;
        if (!Http || !SectionRefresher) return;

        if (this.abortController) this.abortController.abort();
        this.abortController = new AbortController();
        const activeController = this.abortController;

        const ids = Array.isArray(this.sectionId) ? this.sectionId : [this.sectionId];
        const sep = url.includes('?') ? '&' : '?';
        const fetchUrl = url + sep + 'sections=' + ids.map(encodeURIComponent).join(',');

        Http.getJSON(fetchUrl, {
            signal: activeController.signal,
            // Observed on the dev storefront: this request answers 404 when Accept names JSON, and 200 with section JSON for `*/*`.
            headers: { Accept: '*/*' },
        })
            .then((data) => {
                const sections = data?.sections ?? data;
                if (!sections || typeof sections !== 'object') return;

                SectionRefresher.render(sections, this.buildDomMap());

                if (updateHistory) {
                    window.history.pushState({ path: url }, '', url);
                }
            })
            .catch((err) => {
                if (err?.isAbort || err?.name === 'AbortError') return;
                if (updateHistory) window.location.href = url;
            })
            .finally(() => {
                if (this.abortController === activeController) {
                    this.isLoading = false;
                    this.abortController = null;
                }
            });
    },

    loadUrl(url) {
        if (!url || !this.sectionId) return;
        this.isLoading = true;
        if (this._debouncedFetch) {
            this._debouncedFetch(url);
        } else {
            this._executeFetch(url, true);
        }
    },

    onNavClick(event) {
        const link = event.target.closest('[data-pagination-nav] a');
        if (!link) return;
        event.preventDefault();
        this.loadUrl(link.href);
    },

    handlePopState(event) {
        const path = event.state?.path || window.location.href;
        if (!path || !this.sectionId) return;
        if (this._debouncedFetch?.dispose) this._debouncedFetch.dispose();
        this.isLoading = true;
        this._executeFetch(path, false);
    },

    destroy() {
        if (this._debouncedFetch?.dispose) this._debouncedFetch.dispose();
        if (this.abortController) this.abortController.abort();
        if (this.dispose) this.dispose();
    },
}));
