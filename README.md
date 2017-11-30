# Scalecube-js
POC version for scalecube js
Implemented only the Microservices basic pattern only local services without remote services (no gossip or SWIM)

Install `yarn/npm install`
Build `npm build`
Run test `npm test`

## Run/Debug
To run/debug jest tests:
* jest options: --runInBand --no-cache --env=jsdom 
* env variables: BABEL_ENV=commonjs
* you can run/debug via Webstorm or npm test or directly with jest and debug with Chrome: https://facebook.github.io/jest/docs/en/troubleshooting.html
![image](https://user-images.githubusercontent.com/4359435/30782375-e134617e-a139-11e7-8100-32f13ed3815f.png)

## Version 
* http://semver.org/ format

**MAJOR** version when you make incompatible API changes,

**MINOR** version when you add functionality in a backwards-compatible manner, and

**PATCH** version when you make backwards-compatible bug fixes.

## Status & Todos
First implementation, we be restructured to something normal  
- [ ] Create CI, include publish to NPM, run tests etc
- [ ] Browser & NodeJS computability
- [ ] TS, Flow, AMD, ES, CommonJS computability 