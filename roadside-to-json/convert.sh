#!/bin/bash
# Converts  roadsides.csv to csv.json

csvtojson parse io/roadsides.csv --workerNum=2 --ignoreEmpty=true --trim=true > csvtojson.json

node jsonProcess.js
