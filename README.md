# Truck Transport API

[Truck Transport Admin Repo](https://github.com/zohaibtariq/truck-transport-admin-angular)

[Truck Transport Customer Repo](https://github.com/zohaibtariq/truck-transport-customer-angular)

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
docker ps -a
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

### NOTE
#### you need to create an admin user first from mentioned below endpoint of this REPO
````
Register

POST /v1/auth/register
````
#### after registering update its role to "superuser" and set different flags to true like active, emailVerified etc than use this user for admin login then hit below endpoint to populate countries data.

````
Create Countries

POST /v1/countries
````

above endpoint only works with "superadmin" role of registered user

### POST MAN COLLECTION

[POSTMAN COLLECTION FILE OF API'S](https://github.com/zohaibtariq/truck-transport-api-node/blob/development/postman/TruckTransport.postman_collection.json)

[POSTMAN ENVIRONMENT FILE OF API'S](https://github.com/zohaibtariq/truck-transport-api-node/blob/development/postman/TruckTransportLocalAPI.postman_environment.json)