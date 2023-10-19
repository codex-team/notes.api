# Development

## Setup local database

You can install PostgreSQL local https://www.postgresql.org/download/ or use Docker (see `docker-compose.yml`):
```
version: "3.2"
services:
  api:
    build:
      dockerfile: Dockerfile
      context: .
    ports:
      - 127.0.0.1:1337:1337
    volumes:
      - ./app-config.yaml:/usr/app/app-config.yaml
    restart: unless-stopped

  postgres:
    image: postgres
    environment:
      POSTGRES_PASSWORD: example
    ports:
      - 127.0.0.1:5432:5432
    volumes:
      - ./database:/var/lib/postgresql/data
```

To run it execute: `docker compose up -d postgres` where `-d` is used for background run.
If you have outdated version of docker, try use `docker-compose` instead of `docker compose` (https://docs.docker.com/compose/)

## Running application in development mode

To run application in development mode you need to run `npm run dev` command.
It will start application with `nodemon` and restart it on any changes in source code.

You can try to build and run it in local Docker with `docker compose up api` (you can add `-d` flag for a background run).

## Configuration

Default application configuration is stored in `app-config.yaml` file. This file is intended for docker configuration since it's using `dsn: 'postgres://postgres:example@postgres:5432/codex-notes'`.

To override default configuration you can create `app-config.local.yaml` file and override any configuration value locally.
You can also override settings in docker by overriding `app-config.local.yaml` via volumes:
```
    volumes:
      - ./app-config.yaml:/usr/app/app-config.yaml
      - ./app-config.local.yaml:/usr/app/app-config.local.yaml
```

## Logging

We use `pino` library for logging.
You can find configuration for logging behavior in `app-config.yaml` file in `logging` section.
You can configure log level for each module separately.
