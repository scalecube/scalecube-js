---
name: "\U0001F381 Change Request/New Feature Request"
about: Suggest a change in exist feature or the creation of a new feature
title: '🎁 '
labels: ''
assignees: ''

---

## General description
The general description of the change/feature, that will explain the core value and why it's needed.

<!-- add this if this CR have prerequisites -->
#### Prerequisites
Links to any external dependency for this feature

<!-- add this if CR touching/adding/effecting API -->
## API

#### Design description

A clear and concise description of the design proposition.
<!-- answer those questions: -->
1. Is it a breaking change (not backward compatible)? **yes** **no** 
2. Is it adds new API? **yes** **no**
3. Is it changes existing API? **yes** **no**
4. Is it removes existing API? **yes** **no**

<!-- fill this if any of the above question is **yes**  -->
#### Changes
Provide link to a PR or code snippet of old and new API.

## Behavior

#### Consideration
List of everything to consider before writing test cases.

<!-- Do we have any document that can help? PRD, Spec etc..
If yes put links here (make sure it's accessible for all team members) -->

<!-- Does the suggested changes impact the current behavior ?
 If yes, specify which behavior will be changed and how or provide the link to a PR.-->

<!-- Does the suggested changes are specific to some devices/browsers/environments
If yes, specify which devices/browsers/environments -->

<!-- Does the suggested changes require to add new dependencies to the package ?
 If yes, provide the list of dependencies and explain why it's required. -->

<!-- 
Describe the feature behavior the best you can using gherkin feature file 
Link to PR or Gherkin snippet
```gherkin
Given A great package
When I add a new feature
Then I expect it to work fine
```
-->

## Test cases

Add test case that are written in _**[Gherkin Syntax](https://docs.cucumber.io/gherkin/reference/)**_ and cover all the possible scenarios.

## DoR
- [ ] External dependencies have been resolved
- [ ] API has been approved
- [ ] Test cases have been prepared
- [ ] Discussed with Technical lead

<!-- DoD template for PR
## Definition of Done
- [ ] Maintainer review
- [ ] All tests are implemented (automatic testing)
- [ ] Documentation
- [ ] Release notes
-->

## RoadMap

In case there is more than one mergeable point you can specify it here.

NOTICE that DoD is one unit, you CAN'T do implementation then notes then documentation etc.
