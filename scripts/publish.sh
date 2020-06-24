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
    yarn lerna publish --loglevel debug --no-git-tag-version --no-commit-hooks --canary --dist-tag snapshot --preid $ID --yes
    #yarn lerna publish prerelease --no-commit-hooks --dist-tag snapshot --preid $ID --yes -m '[skip ci]' --no-git-tag-version --no-push
    # --no-git-tag-version "turns off" all git operations for `lerna version`
    #yarn lerna version ${VERSION}-${ID} --no-git-tag-version --exact --force-publish --yes
    # "from-package" is the only bump argument for `lerna publish` that does not require git
    #yarn lerna publish from-package --yes
    #yarn lerna publish ${VERSION}-${ID} --no-git-tag-version --force-publish --yes

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
    git fetch --tags
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

