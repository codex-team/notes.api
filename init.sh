#!/bin/sh
set -e
node --loader ts-node/esm dist/repository/storage/postgres/migrations/index.js -c app-config.yaml
node dist/index.js