const motionSessions = new Map();

function resolveMotionSessionId(rootOrId) {
    if (typeof rootOrId === 'string' && rootOrId.trim()) {
        return rootOrId.trim();
    }

    if (rootOrId instanceof Element) {
        const id = rootOrId.dataset?.dialogId;
        return typeof id === 'string' && id.trim() ? id.trim() : null;
    }

    return null;
}

export function beginMotionSession(rootOrId) {
    const id = resolveMotionSessionId(rootOrId);
    if (!id) return 0;
    const next = (motionSessions.get(id) || 0) + 1;
    motionSessions.set(id, next);
    return next;
}

export function isMotionSessionCurrent(rootOrId, session) {
    const id = resolveMotionSessionId(rootOrId);
    if (!id || !session) return false;
    return motionSessions.get(id) === session;
}

export function invalidateMotionSession(rootOrId) {
    beginMotionSession(rootOrId);
}
