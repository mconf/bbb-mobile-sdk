const formatNumber = (num) => (num < 10 ? `0${num}` : `${num}`);

const humanizeSeconds = (time) => {
  if (!time) {
    return '00:00';
  }
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;

  if (hours > 0) {
    return `${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(seconds)}`;
  }
  return `${formatNumber(minutes)}:${formatNumber(seconds)}`;
};

export default {
  humanizeSeconds,
};
