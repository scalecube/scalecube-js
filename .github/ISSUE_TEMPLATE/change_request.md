---
name: Change Request/New Feature Request
about: Suggest a change in exist feature or the creation of a new feature
title: ''
labels: 'feature'
assignees: ''
---

## General description

The general description of the change/feature, that will explain the core value.

#### Prerequisites

Links to any external dependency for this feature

[Link]

## API

#### Design proposition

A clear and concise description of the design proposition.

- [ ] Is backward compatible
- [ ] Adds new API
- [ ] Changes existing API
- [ ] Removes existing API

#### Pull Request

[Link]

#### Old API

Code snippet

```typescript
```

#### New API

Code snippet

```typescript
```

## Behavior

#### Consideration

List of everything to consider before writing test cases:

- [ ] Changes current behaviour

Specify which behaviour will be changed and how or provide the link to PR.

- [ ] Is specific to some devices/browsers/environments

Specify which behaviour will be changed and how or provide the link to PR.

- [ ] Requires the usage of external npm modules

Provide the list of modules with a brief description why this module is required.

<!--
Describe the feature behavior the best you can using gherkin feature file
Link to PR or Gherkin snippet
-->

## Test cases

Link to the PR with test cases, that are written in _**Gherkin Syntax**_ and cover all the possible scenarios.

[Link]

## Key Performance Indicator (KPI) Definition

A clear target that can be measured by the change.

_**Example:** reduce bundle size by X%._

## Ready for implementation

-[ ] External dependencies have been resolved -[ ] API has been approved -[ ] Test cases have been prepared -[ ] Discussed with Technical lead

## Definition of Done

-[ ] Technical lead review

-[ ] Architect review

-[ ] All tests are implemented <!-- automatic testing -->

-[ ] Manual QA

-[ ] Documentation

-[ ] Release notes

-[ ] KPI has been reached

## RoadMap

In case there is more than one mergable point you can specify it here.

NOTICE that DoD is one unit, you CAN'T do implementation then notes then documentation etc.
