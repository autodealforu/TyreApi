const checkRequired = (obj) => {
  let newData = Object.keys(obj)
    .filter((k) => obj[k] != "")
    .reduce((a, k) => ({ ...a, [k]: obj[k] }), {});
  return newData;
};

export default checkRequired;
