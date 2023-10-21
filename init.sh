#!/bin/sh
set -e
node dist/repository/storage/postgres/migrations/index.js -c app-config.yaml
node dist/index.js