#!/bin/bash
set -e

echo "//registry.npmjs.org/:_authToken=\${NPM_TOKEN}" > .npmrc
MSG_PUBLISH_SUCCESS="lerna publish: Succeed"
MSG_PUBLISH_FAIL="lerna publish: Failed"

if [[ "$TRAVIS_BRANCH" =~ ^feature\/.*$ ]]; then
    echo "--------------------------------------------"
    echo "|    Deploying snapshot on npm registry    |"
    echo "--------------------------------------------"
    lerna publish --canary --yes
    if [[ "$?" == 0 ]]; then
        echo $MSG_PUBLISH_SUCCESS
    else
        echo $MSG_PUBLISH_FAIL
    fi
elif [[ "$TRAVIS_BRANCH" == "develop" ]] && [[ "$TRAVIS_PULL_REQUEST" == "false" ]]; then
    echo "--------------------------------------------"
    echo "|     Deploying latest on npm registry     |"
    echo "--------------------------------------------"
    lerna publish patch --yes
    if [[ "$?" == 0 ]]; then
        echo $MSG_PUBLISH_SUCCESS
    else
        echo $MSG_PUBLISH_FAIL
    fi
elif [[ "$TRAVIS_BRANCH" == "master" ]] && [[ "$TRAVIS_PULL_REQUEST" == "false" ]]; then
    echo "--------------------------------------------"
    echo "|     Deploying stable on npm registry     |"
    echo "--------------------------------------------"
    lerna publish minor --dist-tag stable --yes
    if [[ "$?" == 0 ]]; then
        echo $MSG_PUBLISH_SUCCESS
    else
        echo $MSG_PUBLISH_FAIL
    fi
else
    echo "*************************************************"
    echo "*   Not a pull request, npm publish skipped !   *"
    echo "*************************************************"
fi
