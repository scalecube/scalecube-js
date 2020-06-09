jest.unmock('@scalecube/utils');
import utils = require('@scalecube/utils');
utils.isNodejs = jest.fn(() => false);
