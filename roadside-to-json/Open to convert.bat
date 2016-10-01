echo off
cls
echo Are you sure you want to convert? Close this window to cancel.
timeout 10
cls
echo Running csvtojson. Output:
csvtojson parse C:\Users\Smitty\Desktop\Coding\roadside-to-json\roadsides.csv --workerNum=2 --ignoreEmpty=true --trim=true > processed.json
pause
