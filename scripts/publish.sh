#!/bin/bash
set -e

echo "//registry.npmjs.org/:_authToken=\${NPM_TOKEN}" > .npmrc
MSG_VERSION_SUCCESS="npm version: Succeed"
MSG_VERSION_FAIL="npm version: Failed"
MSG_PUBLISH_SUCCESS="npm publish: Succeed"
MSG_PUBLISH_FAIL="npm publish: Failed"

VERSION=$(npm version | grep @ | sed -re "s/\{ '.*': '(.*)',?/\1/g")

if [[ "$TRAVIS_BRANCH" =~ ^feature\/.*$ ]]; then
    BRANCH_NAME=$(echo $TRAVIS_BRANCH | sed "s/[/]/-/g")
    TIMESTAMP=$(date +"%s")
    echo $VERSION-$BRANCH_NAME-$TIMESTAMP
    echo "--------------------------------------------"
    echo "|    Deploying snapshot on npm registry    |"
    echo "--------------------------------------------"
    lerna version $VERSION-$BRANCH_NAME-$TIMESTAMP
    if [[ "$?" == 0 ]]; then
        echo $MSG_VERSION_SUCCESS
    else
        echo $MSG_VERSION_FAIL && exit 1
    fi
    lerna publish --npm-tag snapshot --canary
    if [[ "$?" == 0 ]]; then
        echo $MSG_PUBLISH_SUCCESS
    else
        echo $MSG_PUBLISH_FAIL && exit 2
    fi
elif [[ "$TRAVIS_BRANCH" == "develop" ]] && [[ "$TRAVIS_PULL_REQUEST" == "false" ]]; then
    echo $VERSION
    echo "--------------------------------------------"
    echo "|     Deploying latest on npm registry     |"
    echo "--------------------------------------------"
    lerna version patch
    if [[ "$?" == 0 ]]; then
        echo $MSG_VERSION_SUCCESS
    else
        echo $MSG_VERSION_FAIL && exit 1
    fi
    lerna publish
    if [[ "$?" == 0 ]]; then
        echo $MSG_PUBLISH_SUCCESS
    else
        echo $MSG_PUBLISH_FAIL && exit 2
    fi
else
    echo "*************************************************"
    echo "*   Not a pull request, npm publish skipped !   *"
    echo "*************************************************"
fi
