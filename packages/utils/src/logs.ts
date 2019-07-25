const colorsMap: { [key: string]: string } = {};

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const saveToLogs = (identifier: string, msg: string, extra: { [key: string]: any }, debug?: boolean) => {
  if (!colorsMap[identifier]) {
    colorsMap[identifier] = getRandomColor();
  }

  // tslint:disable
  if (debug) {
    const logColor = `color:${colorsMap[identifier]}`;
    extra && console.log('%c************************', logColor);
    console.log(msg);
    extra &&
      Object.keys(extra).forEach((key: string) => {
        console.log(`${key}: ${JSON.stringify(extra[key], null, 4)}`);
      });
    extra && console.log('%c************************', logColor);
  }
  // tslint:enable
};
