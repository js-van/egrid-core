'use strict';

const vertexFunction = (f) => {
  return function (d, i) {
    const arg = {
      u: d.key,
      d: d.data
    };
    return f.call(this, arg, i);
  };
};

export default vertexFunction;
