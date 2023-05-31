import config from '@infrastructure/config/index.js';
import logger from '@infrastructure/logging/index.js';
import API from '@presentation/index.js';
import runMetricsServer from '@infrastructure/metrics/index.js';
import NoteService from '@domain/service/note.js';
import { NoteRepository } from '@repository/index.js';

const api = new API(config.httpApi);

const start = async (): Promise<void> => {
  try {
    /**
     * TODO - Add database connection and creating storage instance
     */
    const noteRepository = new NoteRepository({});
    const noteService = new NoteService(noteRepository);

    await api.run(noteService);

    if (config.metrics.enabled) {
      await runMetricsServer();
    }

    logger.info('Application launched successfully');
  } catch (err) {
    logger.fatal('Failed to start application', err);
    process.exit(1);
  }
};

start();
