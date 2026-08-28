// The counterpart of the web client's getFirstVisibleLineHtml, over the markdown
// source instead of HTML.
export const getFirstLine = (message) => (message ?? '')
  .split('\n')
  .find((line) => line.trim().length > 0) ?? '';

export default {
  getFirstLine,
};
