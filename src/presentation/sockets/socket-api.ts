import { CTProtoServer } from "ctproto";

/**
 * Интерфейсы для CTProto
 */
interface AuthRequestPayload {
  token: string;
}

interface AuthResponsePayload {
  userId: string;
  username?: string;
}

interface ApiRequest {
  messageId: string;
  type: string;
  payload: any;
}

interface ApiResponse {
  messageId: string;
  type: string;
  payload: any;
}

interface ApiUpdate {
  messageId: string;
  type: string;
  payload: any;
}

export default class SocketApi {
  private ctproto: CTProtoServer<
    AuthRequestPayload,
    AuthResponsePayload,
    ApiRequest,
    ApiResponse,
    ApiUpdate
  >;

  private config: { host: string; port: number };

  constructor(config: { host: string; port: number }) {
    this.config = config;
    this.ctproto = new CTProtoServer({
      port: this.config.port,

      async onAuth(authRequestPayload: AuthRequestPayload): Promise<AuthResponsePayload> {
        console.log("🔑 Проверка токена:", authRequestPayload.token);

        if (!authRequestPayload.token || authRequestPayload.token !== "valid-token") {
          throw new Error("❌ Неверный токен");
        }

        return {
          userId: "111",
          username: "TestUser",
        };
      },

      async onMessage(message: ApiRequest): Promise<ApiResponse> {
        console.log("📩 Получено сообщение от клиента:", message);

        if (message.type === "note:join") {
          return {
            messageId: message.messageId,
            type: "response",
            payload: { status: "joined", noteId: message.payload.noteId },
          };
        }

        return {
          messageId: message.messageId,
          type: "error",
          payload: "❌ Неизвестная команда",
        };
      },
    });

    console.log(`✅ CTProto-сервер запущен на порту ${this.config.port}`);
  }
}
