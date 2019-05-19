#!/usr/bin/sh
npx babel public --presets react-app/prod --extensions ".jsx" public --watch --out-dir public
