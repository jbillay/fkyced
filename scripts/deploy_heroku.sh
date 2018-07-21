#!/bin/bash
cd services
docker build -t registry.heroku.com/fkyced/web .
docker push registry.heroku.com/fkyced/web
