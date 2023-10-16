import API from '@presentation/http/http-server.js';
import config from '@infrastructure/config/index.js';
import { init as initDomainServices } from '@domain/index.js';
import { initORM, init as initRepositories } from '@repository/index.js';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { runTenantMigrations } from '@repository/storage/postgres/migrations/migrate';
import path from 'path';
import { insertData } from './tests/utils/insert-data.js';



describe('API', () => {
  let api: API;
  let postgresContainer: StartedPostgreSqlContainer | undefined;
  const migrationsPath = path.join(process.cwd(), 'migrations', 'tenant');

  beforeAll(async () => {

    postgresContainer = await new PostgreSqlContainer().withUsername('postgres').start();

    const orm = await initORM({ dsn: postgresContainer.getConnectionUri() });

    const repositories = await initRepositories(orm);
    const domainServices = initDomainServices(repositories, config);
    
    await runTenantMigrations(migrationsPath, postgresContainer.getConnectionUri());

    api = await API.init(config.httpApi, domainServices);

    await insertData(orm);
  });

  afterAll(async () => {
    await postgresContainer?.stop();
});

  describe('Notes', () => {
    test('GET /:id returns note of correct structure', async () => {

      expect(api.server).not.toBeNull();

      const response = await api.server?.inject({
        method: 'GET',
        url: '/note/note_1',
      });

      expect(response?.statusCode).toBe(200);
    });
  });
});
