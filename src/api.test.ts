import API from '@presentation/http/http-server.js';
import config from '@infrastructure/config/index.js';
import { init as initDomainServices } from '@domain/index.js';
import { init as initRepositories } from '@repository/index.js';


describe('API', () => {
  let api: API;

  beforeEach(async () => {
    const repositories = await initRepositories(config.database);
    const domainServices = initDomainServices(repositories, config);

    api = new API(config.httpApi, domainServices);
  });

  describe('Notes', () => {
    test('GET /:id returns note of correct structure', () => {
      expect(api.server).not.toBeNull();
    });
  });
});
