const fetchStunTurnServers = (url) => {
  const handleStunTurnResponse = ({ stunServers, turnServers }) => {
    if (!stunServers && !turnServers) {
      return Promise.reject(new Error('Could not fetch STUN/TURN servers'));
    }

    const turnReply = [];
    (turnServers || []).forEach((turnEntry) => {
      const { password, _url, username } = turnEntry;
      turnReply.push({
        urls: _url,
        password,
        username,
      });
    });

    return Promise.resolve({
      stun: (stunServers || []).map((server) => server.url),
      turn: turnReply,
    });
  };

  return fetch(url, { credentials: 'include' })
    .then((res) => res.json())
    .then(handleStunTurnResponse);
};

const mapStunTurn = ({ stun, turn }) => {
  const rtcStuns = stun.map((url) => ({ urls: url }));
  const rtcTurns = turn.map((t) => ({ urls: t.urls, credential: t.password, username: t.username }));
  return rtcStuns.concat(rtcTurns);
};

// Per-instance ICE server cache. Keyed by the fetch URL (which embeds the host
// and the session token) so a breakout room on another host/session never
// reuses the main room's servers, and caching the in-flight promise means the
// three managers' concurrent init() calls share a single request.
export const createIceServerCache = () => {
  const cache = new Map();

  const fetchIceServers = (url) => {
    if (cache.has(url)) return cache.get(url);

    const request = fetchStunTurnServers(url)
      .then(mapStunTurn)
      .catch((error) => {
        // Do not cache failures
        cache.delete(url);
        throw error;
      });

    cache.set(url, request);

    return request;
  };

  return { fetch: fetchIceServers };
};

export default createIceServerCache;
