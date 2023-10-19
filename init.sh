#!/bin/sh
set -e
npm run migrate
node dist/index.js