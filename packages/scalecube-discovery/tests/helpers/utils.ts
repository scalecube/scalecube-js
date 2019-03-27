export const expectWithFailNow = (expect: () => void, done: { fail: (error: Error) => void }) => {
  try {
    expect();
  } catch (error) {
    done.fail(error);
  }
};
