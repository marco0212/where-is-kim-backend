export const checkIsExist = (arr, target) =>
  !!arr.filter((ele) => {
    if (typeof ele !== "string") {
      return ele.toString() === target;
    }

    return ele === target;
  }).length;
