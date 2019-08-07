import { Gateway } from '../../src/Gateway';
import { getInvalidRequestHandler } from '../../src/helpers/constants';

const port = 8086;

test.each(['', [], {}, true, false, 10, null])(
  `
    Scenario: gateway requestResponse plugin must be type Function
    Given  Gateway with invalid plugin
              | type         | value         |
              | empty string | ''            |
              | array	       | []            |
              | object	     | {}            |
              | boolean	     | true          |
              | boolean	     | false         |
              | number	     | 10            |
              | null	       | null          |

    When creating a gateway
    Then throw exception`,
  (requestResponse) => {
    expect.assertions(1);
    try {
      new Gateway({ port, requestResponse });
    } catch (e) {
      expect(e.message).toMatch(getInvalidRequestHandler('requestResponse', typeof requestResponse));
    }
  }
);

test.each(['', [], {}, true, false, 10, null])(
  `
    Scenario: gateway requestStream plugin must be type Function
    Given  Gateway with invalid plugin
              | type         | value         |
              | empty string | ''            |
              | array	       | []            |
              | object	     | {}            |
              | boolean	     | true          |
              | boolean	     | false         |
              | number	     | 10            |
              | null	       | null          |

    When creating a gateway
    Then throw exception`,
  (requestStream) => {
    expect.assertions(1);
    try {
      new Gateway({ port, requestStream });
    } catch (e) {
      expect(e.message).toMatch(getInvalidRequestHandler('requestStream', typeof requestStream));
    }
  }
);
