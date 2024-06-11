#!/usr/bin/env bash

set -euo pipefail

DEPLOY_PATH="/var/www/odysseus/hansca/"
SOURCE_PATH="dist/"

npm run build:live

rsync -avzr --delete "$SOURCE_PATH" "$DEPLOY_PATH"
echo "Deployed to $DEPLOY_PATH"
