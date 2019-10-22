#!/bin/bash
set -e

MSG_PUBLISH_SUCCESS="lerna publish: Succeed"
MSG_PUBLISH_FAIL="lerna publish: Failed"

git status

if [[ "$TRAVIS_BRANCH" =~ ^feature\/.*$ ]]; then
    echo "--------------------------------------------"
    echo "|    Deploying snapshot on npm registry    |"
    echo "--------------------------------------------"

    lerna publish from-package --canary --dist-tag snapshot --preid alpha.$(date +%s) --yes
    if [[ "$?" == 0 ]]; then
        echo $MSG_PUBLISH_SUCCESS
    else
        echo $MSG_PUBLISH_FAIL
    fi
elif [[ "$TRAVIS_BRANCH" == "develop" ]] && [[ "$TRAVIS_PULL_REQUEST" == "false" ]]; then
    echo "--------------------------------------------"
    echo "|     Deploying latest on npm registry     |"
    echo "--------------------------------------------"

    git remote set-url origin https://${GH_TOKEN}@github.com/scalecube/scalecube-js.git
    git checkout develop
    lerna publish prerelease --dist-tag next --preid next --yes -m '[skip ci]'

    if [[ "$?" == 0 ]]; then
        echo $MSG_PUBLISH_SUCCESS
    else
        echo $MSG_PUBLISH_FAIL
    fi
elif [[ "$TRAVIS_BRANCH" == "master" ]] && [[ "$TRAVIS_PULL_REQUEST" == "false" ]]; then
    echo "--------------------------------------------"
    echo "|     Deploying stable on npm registry     |"
    echo "--------------------------------------------"

    git remote set-url origin https://${GH_TOKEN}@github.com/scalecube/scalecube-js.git
    git checkout master
    lerna publish patch --yes -m '[skip ci]'

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
