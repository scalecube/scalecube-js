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
    #git fetch --depth=50
    ID="snapshot.${BRANCH//\//-}.$(date +%s)"
    VERSION=$(jq -r .version lerna.json)
    git config --global user.email "ci@scalecube.io"
    git config --global user.name "scalecube ci"
    git tag -a v$VERSION -m "[skip ci]"
    yarn lerna publish --loglevel debug --force-publish --no-git-tag-version --no-commit-hooks --canary --dist-tag snapshot --pre-dist-tag snapshot --preid $ID --yes

    if [[ "$?" == 0 ]]; then
        echo $MSG_PUBLISH_SUCCESS
    else
        echo $MSG_PUBLISH_FAIL
    fi
elif [[ "$BRANCH" == "develop" ]] && [[ "$IS_PULL_REQUEST" == "false" ]]; then
    echo "--------------------------------------------"
    echo "|     Deploying latest on npm registry     |"
    echo "--------------------------------------------"

    git config --global user.email "ci@scalecube.io"
    git config --global user.name "scalecube ci"
    git remote set-url origin https://${GH_TOKEN}@github.com/scalecube/scalecube-js.git
    git checkout develop
    #yarn lerna publish --canary --dist-tag next --preid develop.$(date +%s) --yes
    ID="develop.$(date +%s)"
    git fetch --tags
    #git tag -a v$VERSION-$ID -m "[skip ci]"
    
    #yarn lerna publish --loglevel debug --force-publish --no-git-tag-version --no-commit-hooks --canary --dist-tag develop --pre-dist-tag develop --preid $ID --yes
    yarn lerna version prepatch --preid $ID --no-push --yes
    yarn lerna publish from-package --force-publish --dist-tag develop --loglevel debug --yes 
    VERSION=$(jq -r .version lerna.json)

    if [[ "$?" == 0 ]]; then
        echo $MSG_PUBLISH_SUCCESS
        bash scripts/./verify.sh $VERSION
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

