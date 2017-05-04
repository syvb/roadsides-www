#!/bin/bash
# Converts  roadsides.csv to csv.json

echo "Downloading Google Sheet..."
curl https://docs.google.com/spreadsheets/d/1PVn85xw6xt7YQgUYJrMJ_UgTC_XHyvxujfzwc6ff7BM/export?format=csv > io/roadsides.csv
echo "Turning into JSON"
csvtojson parse io/roadsides.csv --workerNum=2 --ignoreEmpty=true --trim=true > csvtojson.json
echo "Processing file..."
node jsonProcess.js
echo "Copying to server..."
cp io/processed.json ../../temp-api/roadsides.json
echo "Done!"
echo "Restart the backend server, now."