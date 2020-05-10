#!/bin/bash

# one liner off Stack Overflow
SH_LOCATION="$( cd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null 2>&1 && pwd )"

node -r source-map-support/register "${SH_LOCATION}/../build/src/main" "$@"
