#!/bin/bash
cd /home/kavia/workspace/code-generation/noteease-29972-64e2072e/noteease_main_container
npx eslint
ESLINT_EXIT_CODE=$?
npm run build
BUILD_EXIT_CODE=$?
if [ $ESLINT_EXIT_CODE -ne 0 ] || [ $BUILD_EXIT_CODE -ne 0 ]; then
   exit 1
fi

