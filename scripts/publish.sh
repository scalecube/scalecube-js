#!/bin/bash
set -e

MSG_PUBLISH_SUCCESS="lerna publish: Succeed"
MSG_PUBLISH_FAIL="lerna publish: Failed"
BRANCH=""
IS_PULL_REQUEST="false"

if [ "$GITHUB_EVENT_NAME" = "pull_request" ]; then
  IS_PULL_REQUEST="true"
  BRANCH=${GITHUB_HEAD_REF}
else
  BRANCH=${GITHUB_REF:11}
fi

git status

if [[ "$BRANCH" =~ ^feature\/.*$ ]]; then
    echo "--------------------------------------------"
    echo "|    Deploying snapshot on npm registry    |"
    echo "--------------------------------------------"

    yarn lerna publish --no-commit-hooks --canary --dist-tag snapshot --preid alpha.$(date +%s) --yes
    cat lerna-debug.log
    if [[ "$?" == 0 ]]; then
        echo $MSG_PUBLISH_SUCCESS
    else
        echo $MSG_PUBLISH_FAIL
    fi
elif [[ "$BRANCH" == "develop" ]] && [[ "$IS_PULL_REQUEST" == "false" ]]; then
    echo "--------------------------------------------"
    echo "|     Deploying latest on npm registry     |"
    echo "--------------------------------------------"

    git remote set-url origin https://${GH_TOKEN}@github.com/scalecube/scalecube-js.git
    git checkout develop
    #yarn lerna publish --canary --dist-tag next --preid develop.$(date +%s) --yes
    ID="develop.$(date +%s)"
    yarn lerna publish prerelease --no-commit-hooks --dist-tag next --preid $ID --yes -m '[skip ci]' --no-git-tag-version --no-push

    if [[ "$?" == 0 ]]; then
        echo $MSG_PUBLISH_SUCCESS
        bash ./verify.sh $ID
    else
        echo $MSG_PUBLISH_FAIL
    fi
#elif [[ "$BRANCH" == "master" ]] && [[ "$IS_PULL_REQUEST" == "false" ]]; then
#    echo "--------------------------------------------"
#    echo "|     Deploying stable on npm registry     |"
#    echo "--------------------------------------------"
#
#    git remote set-url origin https://${GH_TOKEN}@github.com/scalecube/scalecube-js.git
#    git checkout master
#    lerna publish patch --yes -m '[skip ci]'
#
#    if [[ "$?" == 0 ]]; then
#        echo $MSG_PUBLISH_SUCCESS
#    else
#        echo $MSG_PUBLISH_FAIL
#    fi
else
    echo "*************************************************"
    echo "*   Not a pull request, npm publish skipped !   *"
    echo "*************************************************"
fi

