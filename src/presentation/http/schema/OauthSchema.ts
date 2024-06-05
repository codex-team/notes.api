export const OauthSchema = {
  $id: 'OauthSchema',
  type: 'object',
  required: [
    'clientId',
    'clientSecret',
  ],
  properties: {
    clientId: {
      type: 'string',
      description: 'Google client id token',
    },

    clientSecret: {
      type: 'string',
      description: 'Google client secret key',
    },

    accessToken: {
      type: 'string',
      description: 'The returned access token from Google',
    },

    refreshToken: {
      type: 'string',
      description: 'The returned refreshtoken from Google',
    },
  },
};
