#!/bin/bash

VERSION=$1
if [ "$VERSION" = "" ] ; then
  echo "Please specify a version to verify"
  exit 1
fi
DIR=$(pwd)
cd $DIR/packages/examples/k8s
npx json -I -f package.json -e "this.dependencies['@scalecube/node']='$VERSION'"
cd $DIR/packages/examples/
yarn test
docker build . -t scalecube-example:bundle --build-arg VERSION=$VERSION