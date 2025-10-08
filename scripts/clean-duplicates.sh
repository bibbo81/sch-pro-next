#!/bin/bash

# Load .env.local
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

# Run cleanup
node scripts/clean-duplicate-providers.mjs
