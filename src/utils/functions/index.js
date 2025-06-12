// TODO: review these humanize functions and cleanup

// added from html code
const humanizeSecondsLive = (time) => {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;
  const formatNumber = (num) => {
    if (num < 10) {
      return `0${num}`;
    }
    return num.toString();
  };

  if (hours > 0) {
    return `${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(seconds)}`;
  }
  return `${formatNumber(minutes)}:${formatNumber(seconds)}`;
};

// old humanize that does not handle hours
const humanizeSeconds = (time) => {
  if (!time) {
    return '00:00';
  }
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return [
    minutes,
    seconds,
  ].map((x) => {
    if (x < 10) {
      return `0${x}`;
    }
    return x;
  },).join(':');
};

// update for breakouts to add hours
const humanizeSecondsWithHours = (time) => {
  if (time == null || time < 0) {
    return '00:00';
  }

  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;

  if (hours > 0) {
    return [
      hours,
      minutes,
      seconds
    ]
    .map(x => x < 10 ? `0${x}` : x)
    .join(':');
  } else if (minutes > 0) {
    return [
      minutes,
      seconds
    ]
    .map(x => x < 10 ? `0${x}` : x)
    .join(':');
  } else {
    return `00:${seconds < 10 ? `0${seconds}` : seconds}`;
  }
};

const arraysEqual = (a1, a2) => {
  // eslint-disable-next-line eqeqeq
  return JSON.stringify(a1) == JSON.stringify(a2);
};

const parseQueryString = (url) => {
  const queryString = url.split('?')[1];
  if (!queryString) {
    return {};
  }

  const params = {};
  const keyValuePairs = queryString.split('&');

  keyValuePairs.forEach((pair) => {
    const [key, value] = pair.split('=');
    params[key] = decodeURIComponent(value || '');
  });

  return params;
};

const getHostFromUrl = (url) => {
  const regex = /^(?:[^:\n]+:\/\/)?([^:#/\n]*)/;
  const match = url.match(regex);
  const host = match ? match[1] : null;
  return host;
};

function xml2json(xmlString) {
  const responseRegex = /<response>([\s\S]*?)<\/response>/;
  const elementRegex = /<([a-zA-Z0-9_-]+)>([\s\S]*?)<\/\1>/g;

  const responseMatch = responseRegex.exec(xmlString);
  if (responseMatch) {
    const responseData = responseMatch[1];

    let match;
    const result = {};

    // eslint-disable-next-line no-cond-assign
    while ((match = elementRegex.exec(responseData)) !== null) {
      const elementName = match[1];
      const elementValue = match[2].trim();

      if (result[elementName] === undefined) {
        result[elementName] = [];
      }

      result[elementName] = elementValue;
    }

    return result;
  }
  console.error('No <response> tag found in XML');
}

export default {
  humanizeSeconds,
  humanizeSecondsLive,
  humanizeSecondsWithHours,
  arraysEqual,
  parseQueryString,
  getHostFromUrl,
  xml2json
};
