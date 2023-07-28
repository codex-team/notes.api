import GetUserInfoResponsePayload from '@repository/transport/google-api/types/GetUserInfoResponsePayload.js';

/**
 * Response payload, which is returned by Google API
 */
type Payload = GetUserInfoResponsePayload;

interface ApiErrorResponse {
  error: {
    /**
     * Error message
     */
    message: string;
  }
}

export type ApiResponse = Payload | ApiErrorResponse;
