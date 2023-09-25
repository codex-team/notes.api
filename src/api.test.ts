import API from '@presentation/http/http-server.js';
import config from '@infrastructure/config/index.js';
import { init as initDomainServices } from '@domain/index.js';
import { init as initRepositories } from '@repository/index.js';


describe('API', () => {
  let api: API;

  beforeEach(async () => {
    const repositories = await initRepositories(config.database);
    const domainServices = initDomainServices(repositories, config);

    api = await API.init(config.httpApi, domainServices);
  });

  describe('Notes', () => {
    test('GET /:id returns note of correct structure', async () => {
      expect(api.server).not.toBeNull();

      const response = await api.server?.inject({
        method: 'GET',
        url: '/note/1',
      });



      // try {
      //   const response = await api.server.inject({
      //     method: 'GET',
      //     url: '/note/1',
      //   });

      // } catch (err) {
      //   console.log(err)
      // }

      expect(response?.statusCode).toBe(200);
    });
  });
});
