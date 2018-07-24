#!/bin/sh

set -e

echo "Validating required params..."

if [ -z $CONSUL_FOLDER ]; then
  echo "CONSUL_FOLDER is missing"
  exit 1
fi

if [ -z $CONSUL_HTTP_ADDR ]; then
  echo "CONSUL_HTTP_ADDR is missing"
  exit 2
fi

if [ -z $CONSUL_HTTP_TOKEN ]; then
  echo "CONSUL_HTTP_TOKEN is missing"
  exit 3
fi

echo "Getting configuration from consul..."

./consul-template -config /config.hcl -once -log-level trace &

echo "Booting application..."

forever --watch --watchDirectory /build-mon/app /build-mon/app/app.js
