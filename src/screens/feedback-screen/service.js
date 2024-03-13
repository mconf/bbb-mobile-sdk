const isAnyOptionChecked = (optionsStatus) => {
  return Object.values(optionsStatus).some((value) => {
    return value;
  });
};

const setMessageText = (problemDetalied, text) => {
  problemDetalied.text = text;
};

export default {
  isAnyOptionChecked,
  setMessageText,
};
