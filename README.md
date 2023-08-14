# Truck Transport API

### DOCKER COMMANDS

#### to build docker container
````
docker compose build
````

#### to start docker container
````
docker compose up -d
````

#### to stop docker container
````
docker compose down
````

#### to navigate inside a docker container
````
docker exec -it CONTAINER_NAME_OR_ID bash
````

#### to see all active docker containers
````
docker ps
````

#### to see all active/inactive docker containers
````
docker psa
````

#### to check logs of a docker container
````
docker logs CONTAINER_NAME_OR_ID
````

### API ENDPOINT
````
http://localhost:3000/v1/
````

### API DOCS
````
http://localhost:3000/v1/docs/
````
