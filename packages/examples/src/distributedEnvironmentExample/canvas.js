canvasUtil = (() => {
  const activeMembers = [];
  const waitingCircles = [];

  const writeText = (c, legend, font, color) => {
    const { x, y, title, subText } = legend;
    c.font = font;
    c.fillStyle = color;
    c.fillText(title, x, y);
    c.fillText(subText, x, y + 20);
  };

  const Item = (c, name, x, y, boxColor, circleArr, legend) => {
    let stop = false;

    c.fillStyle = boxColor;
    c.fillRect(x, y, 50, 50);

    writeText(c, legend, '14px Arial', boxColor);

    waitingCircles.forEach((waitCircle) => {
      const key = Object.keys(waitCircle)[0];
      if (key === name) {
        waitCircle[key]();
      }
    });

    Array.isArray(circleArr) &&
      circleArr.forEach(({ endX, endY, color, dependency }) => {
        if (endX === null) {
          return {};
        }

        let progressY = 0;

        if (y < endY) {
          progressY = 1;
        } else if (y > endY) {
          progressY = -1;
        }

        let progressX = 0;

        if (x < endX) {
          progressX = 1;
        } else if (x > endX) {
          progressX = -1;
        }

        let nextX = progressX === 0 ? x + 25 : x + 50 * progressX;
        let nextY = progressY === 0 ? y + 25 : y + 50 * progressY;

        const drawCircle = () => {
          c.clearRect(
            progressX === 0 ? nextX - 5 : nextX - 5 * progressX,
            progressY === 0 ? nextY - 5 : nextY - 5 * progressY,
            progressX === -1 ? -15 : 15,
            progressY === -1 ? -15 : 15
          );

          c.fillStyle = color;
          c.fillRect(x, y, 50, 50);

          if (!stop) {
            c.beginPath();
            c.arc(
              progressX === 0 ? nextX : nextX + 5 * progressX,
              progressY === 0 ? nextY : nextY + 5 * progressY,
              3,
              0,
              Math.PI * 2,
              false
            );
            c.strokeStyle = color;
            c.stroke();
          } else {
            c.beginPath();
            c.moveTo(nextX, nextY);
            c.lineTo(nextX + 1, nextY + 1);
            c.strokeStyle = 'black';
            c.stroke();
          }
        };

        function animate() {
          requestAnimationFrame(animate);

          nextX += 5 * progressX;
          nextY -= -5 * progressY;
          // console.log('x', progressX, 'nextX', nextX, 'x', x, 'endX', endX)
          // console.log('y', progressY, 'nextY', nextY, 'y', y, 'endY', endY)
          drawCircle();

          if (progressX === 0) {
            if (nextX < endX + 10 * progressX) {
              nextX = x + 25;
            }
          }

          if (progressX === -1) {
            if (nextX < endX - 75 * progressX) {
              nextX = x + 50 * progressX;
            }
          }

          if (progressX === 1) {
            if (nextX > endX - 25 * progressX) {
              nextX = x + 50 * progressX;
            }
          }

          if (progressY === -1) {
            if (nextY < endY + 75 * progressY * -1) {
              nextY = y - 50 * progressY * -1;
            }
          }
          if (progressY === 1) {
            if (nextY > endY + 25 * progressY * -1) {
              nextY = y + 50 * progressY;
            }
          }

          if (progressY === 0) {
            if (nextY < endY + 10 * progressY * -1) {
              nextY = y + 25;
            }
          }
        }

        if (activeMembers.indexOf(dependency) > -1) {
          animate();
        } else {
          waitingCircles.push({
            [dependency]: () => {
              animate();
            },
          });
        }
      });

    return {
      stopFlag: () => {
        stop = true;
      },
    };
  };

  return {
    setLayeout: () => {
      const canvas = document.getElementById('canvas');
      canvas.width = window.innerWidth * 0.75;
      canvas.height = window.innerHeight;
      const c = canvas.getContext('2d');

      return {
        addMember: (name, ...config) => {
          activeMembers.push(name);
          return Item(c, name, ...config);
        },
        explanation: (title, x, y, size = 14, color = 'black') => {
          writeText(c, { x, y, title, subText: '' }, `${size}px Arial`, color);
        },
      };
    },
  };
})();
