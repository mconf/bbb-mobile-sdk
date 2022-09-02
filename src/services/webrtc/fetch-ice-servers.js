let STUN_TURN_DICT = null;
let MAPPED_STUN_TURN_DICT;

const fetchStunTurnServers = (url) => {
  if (STUN_TURN_DICT) return Promise.resolve(STUN_TURN_DICT);

  const handleStunTurnResponse = ({ stunServers, turnServers }) => {
    if (!stunServers && !turnServers) {
      return Promise.reject(new Error('Could not fetch STUN/TURN servers'));
    }

    const turnReply = [];
    turnServers.forEach((turnEntry) => {
      const { password, _url, username } = turnEntry;
      turnReply.push({
        urls: _url,
        password,
        username,
      });
    });

    const stDictionary = {
      stun: stunServers.map(server => server.url),
      turn: turnReply,
    };

    STUN_TURN_DICT = stDictionary;

    return Promise.resolve(stDictionary);
  };

  return fetch(url, { credentials: 'include' })
    .then(res => res.json())
    .then(handleStunTurnResponse);
};

const mapStunTurn = ({ stun, turn }) => {
  const rtcStuns = stun.map(url => ({ urls: url }));
  const rtcTurns = turn.map(t => ({ urls: t.urls, credential: t.password, username: t.username }));
  return rtcStuns.concat(rtcTurns);
};

const fetchIceServers = async (url) => {
  if (MAPPED_STUN_TURN_DICT) {
    return MAPPED_STUN_TURN_DICT;
  }

  const stDictionary = await fetchStunTurnServers(url);
  const mappedIceServers = mapStunTurn(stDictionary);
  MAPPED_STUN_TURN_DICT = mappedIceServers;

  return mappedIceServers;
}

export default fetchIceServers;
