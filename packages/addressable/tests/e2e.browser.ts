describe(`Scenario Outline: multiple threads ping pong`, () => {
  const examples = [
    { thread: 'main', address: 'main' },
    { thread: 'main', address: 'iframe' },
    { thread: 'main', address: 'worker' },
    { thread: 'iframe', address: 'main' },
    { thread: 'iframe', address: 'iframe' },
    { thread: 'iframe', address: 'worker' },
    { thread: 'worker', address: 'main' },
    { thread: 'worker', address: 'iframe' },
    { thread: 'worker', address: 'worker' },
  ];
  const pongs = [];
  beforeAll(async () => {
    page.on('console', (msg) => {
      // tslint:disable-next-line:no-console
      console.log(msg.text());
      pongs.push(msg.text());
    });
    await page.goto('http://localhost:8000/packages/addressable/tests/fixtures/pingPong/');
    // tslint:disable-next-line:no-console
    console.log('page loaded');
  });

  examples.forEach((example) => {
    test(`Given port from connect(${example.address}) inside ${example.thread}
                    When  port.postmessage('ping')
                    Then  port should receive pong`, async (done) => {
      const val = setInterval(() => {
        if (pongs.includes(`${example.thread} got pong from ${example.address}`)) {
          done();
        }
      }, 0);
    });
  });
});
