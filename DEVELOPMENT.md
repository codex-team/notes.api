# Development

## Running in development mode

To run application in development mode you need to run `npm run dev` command.
It will start application with `nodemon` and restart it on any changes in source code.

## Logging

We use `pino` library for logging.
You can find configuration for logging behavior in `app-config.yaml` file in `logging` section.
You can configure log level for each module separately.
