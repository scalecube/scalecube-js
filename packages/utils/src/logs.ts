const colorsMap: { [key: string]: string } = {};

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const saveToLogs = (
  identifier: string,
  msg: string,
  extra: { [key: string]: any },
  debug?: boolean,
  type: 'log' | 'warn' = 'log'
) => {
  if (!colorsMap[identifier]) {
    colorsMap[identifier] = getRandomColor();
  }

  // tslint:disable
  if (debug) {
    const logColor = `color:${colorsMap[identifier]}`;
    extra && console[type](`%c******** address: ${identifier}********`, logColor);
    console[type](msg);
    extra &&
      Object.keys(extra).forEach((key: string) => {
        console[type](`${key}: ${JSON.stringify(extra[key], null, 2)}`);
      });
  }
  // tslint:enable
};
