<!-- prettier-ignore -->

[![Join the chat at https://gitter.im/scalecube-js/Lobby](https://badges.gitter.im/scalecube-js/Lobby.svg)](https://gitter.im/scalecube-js/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> **NOTICE** versions 0.0.x are experimental without LTS or the API and behavior might change from patch to patch

# Scalecube

Microservices library inspired by the java scalecube-services. scalecube provides an abstraction toolkit to provision and consume microservices as such the interaction model is by a service api avoiding tight-coupling between service implementation and technology.

## Project Status

currently we are working on version 0.2.x
and it will be the first version with LTS (meaning the API will be backwards compatible until the major will change).
The SLA is still under debate and will be release as part of 0.2.x
for more details about 0.2.x go to <https://github.com/scalecube/scalecube-js/issues/30>

## Install

yarn add @scalecube/scalecube-microservice

import Microservices from '@scalecube/scalecube-microservice'

## Basic Usage

[scalecube basic usage](packages/scalecube-microservice/README.md)

For more details how to use it see the tests

## Run/Debug

Install `yarn/npm install`  
Build `npm build`  
Run test `npm test`

To run/debug jest tests:

-   jest options: --runInBand --no-cache --env=jsdom
-   env variables: BABEL_ENV=commonjs
-   you can run/debug via Webstorm or npm test or directly with jest and debug with Chrome: <https://facebook.github.io/jest/docs/en/troubleshooting.html>
    ![image](https://user-images.githubusercontent.com/4359435/30782375-e134617e-a139-11e7-8100-32f13ed3815f.png)

## Version

-   [semver format](http://semver.org/)

**MAJOR** version when you make incompatible API changes,

**MINOR** version when you add functionality in a backwards-compatible manner, and

**PATCH** version when you make backwards-compatible bug fixes.
