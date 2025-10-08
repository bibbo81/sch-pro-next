#!/bin/bash

# Load .env.local
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

# Run verification
node scripts/verify-db.mjs
