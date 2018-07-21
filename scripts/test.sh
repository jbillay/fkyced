#!/bin/bash
/usr/local/bin/docker-compose exec -e NODE_ENV=test fkyced-app npm test
/usr/local/bin/docker-compose exec -e NODE_ENV=test fkyced-admin npm test
