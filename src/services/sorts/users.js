const sortUsersByName = (a, b) => {
  const aName = a.name ? a.name.toLowerCase() : '';
  const bName = b.name ? b.name.toLowerCase() : '';

  return aName.localeCompare(bName);
};

export {
  sortUsersByName,
};
