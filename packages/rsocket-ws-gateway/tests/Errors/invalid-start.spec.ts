import { Gateway } from '../../src/Gateway';
import {
  SERVICE_CALL_MUST_BE_OBJECT,
  REQUST_STREAM_MUST_BE_FUNCTION,
  REQUST_RESPONSE_MUST_BE_FUNCTION,
} from '../../src/helpers/constants';

const port = 8088;
const gateway = new Gateway({ port });
test.each(['', [], () => {}, true, false, 10, null, undefined])(
  `
    Scenario: gateway start with invalid serviceCall
    Given  Gateway 
    And call start with invalid serviceCall
              | type         | value         |
              | empty string | ''            |
              | array	       | []            |
              | function	   | ()=>{}        |
              | boolean	     | true          |
              | boolean	     | false         |
              | number	     | 10            |
              | null	       | null          |
              | undefined	   | undefined     |

    When creating a gateway
    Then throw exception`,
  (serviceCall) => {
    expect.assertions(1);
    try {
      gateway.start({ serviceCall });
    } catch (e) {
      expect(e.message).toMatch(SERVICE_CALL_MUST_BE_OBJECT);
    }
  }
);

test.each(['', [], {}, true, false, 10, null, undefined])(
  `
    Scenario: gateway start with invalid serviceCall
    Given  Gateway 
    And call start with invalid serviceCall (invalid requestStream)
              | type         | value         |
              | empty string | ''            |
              | array	       | []            |
              | object   	   | {}            |
              | boolean	     | true          |
              | boolean	     | false         |
              | number	     | 10            |
              | null	       | null          |
              | undefined	   | undefined     |

    When creating a gateway
    Then throw exception`,
  (requestStream) => {
    expect.assertions(1);
    try {
      gateway.start({
        serviceCall: {
          requestStream,
          // @ts-ignore
          requestResponse: () => {},
        },
      });
    } catch (e) {
      expect(e.message).toMatch(REQUST_STREAM_MUST_BE_FUNCTION);
    }
  }
);

test.each(['', [], {}, true, false, 10, null, undefined])(
  `
    Scenario: gateway start with invalid serviceCall
    Given  Gateway
    And call start with invalid serviceCall (invalid requestResponse)
              | type         | value         |
              | empty string | ''            |
              | array	       | []            |
              | object   	   | {}            |
              | boolean	     | true          |
              | boolean	     | false         |
              | number	     | 10            |
              | null	       | null          |
              | undefined	   | undefined     |

    When creating a gateway
    Then throw exception`,
  (requestResponse) => {
    expect.assertions(1);
    try {
      gateway.start({
        serviceCall: {
          // @ts-ignore
          requestStream: () => {},
          requestResponse,
        },
      });
    } catch (e) {
      gateway.stop();
      expect(e.message).toMatch(REQUST_RESPONSE_MUST_BE_FUNCTION);
    }
  }
);
