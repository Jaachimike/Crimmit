## Description

Nest App with User Management and User Authentication.

## Project setup

## Local Setup

```bash
$ npm install
```

## Docker Setup

1. Ensure you have Docker and Docker Compose installed on your system.
2. Clone this repository

```bash
git clone https://github.com/Jaachimike/Crimmit.git
cd Crimmit
```

## Environment Variables

1. Copy the .env.template file to create a new .env file:

```bash
cp .env.template .env
```

2. Open the .env file and replace the placeholder values with your actual MongoDB URI and JWT secret.

## Running the Application

## Local Development

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Using Docker

1. Build and start the containers:

```bash
docker-compose up --build
```

2. The application will be available at [http://localhost:3000](http://localhost:3000).

3. To stop the application, use Ctrl+C in the terminal or run:

```bash
docker-compose down
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
