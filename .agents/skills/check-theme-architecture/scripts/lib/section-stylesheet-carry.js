/**
 * Carry <style data-section-stylesheet> from a parsed Section Rendering document
 * into a live target element. Used by SectionRefresher.render() innerSelectors path
 * in assets/https.js — keep both implementations in sync.
 */
function carryInnerSectionStylesheet(doc, targetEl) {
    const sectionStyle = doc.querySelector('style[data-section-stylesheet]');
    if (!sectionStyle) {
        return { action: 'none' };
    }

    const existingStyle = targetEl.querySelector('style[data-section-stylesheet]');
    const nextStyle = sectionStyle.cloneNode(true);

    if (existingStyle) {
        existingStyle.replaceWith(nextStyle);
        return { action: 'replaced' };
    }

    targetEl.insertBefore(nextStyle, targetEl.firstChild);
    return { action: 'inserted' };
}

module.exports = { carryInnerSectionStylesheet };
