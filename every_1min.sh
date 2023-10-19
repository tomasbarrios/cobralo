#!/bin/sh

# We use #!/bin/bash -l instead of #!/bin/sh because we need environment variables to be loaded
# https://stackoverflow.com/questions/2229825/where-can-i-set-environment-variables-that-crontab-will-use/51591762#51591762

# Terminate the script on a first error, disallow unbound variables.
set -eu

echo "Hello from cron task on $(date)"

# NODE_ENV=production

# node dist/initCreateDeliveryAttemptsPending.js

# npm run job:createPendingDelivery