#!/usr/bin/env bash
set -e
while true
do
  ./run.sh || echo Execution failed with status $?, restarting in 60 seconds...
  sleep 60
done
