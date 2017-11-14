
#!/bin/sh
echo "Starting!"
kill $(fuser -n tcp 80 2> /dev/null)
kill $(fuser -n tcp 8081 2> /dev/null)
kill $(fuser -n tcp 8082 2> /dev/null)
kill $(fuser -n tcp 8080 2> /dev/null)
kill $(fuser -n tcp 8443 2> /dev/null)

cd roadside-to-json
sh convert.sh
cd ..
(http-server -p 80 > /dev/null) &  (json-server ../temp-api/roadsides.json --ro --port 8080 > /dev/null) &
#sleep 3 
#until (node prerender -a); do
#    echo "Retrying in 3 seconds."
#    sleep 3
#    echo "Retrying."
#done
echo "Started servers!"
