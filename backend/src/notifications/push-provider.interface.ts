export const PUSH_PROVIDER = 'PUSH_PROVIDER';

export interface PushMessage {
  token: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export interface IPushProvider {
  /**
   * Sends push messages and returns the tokens that turned out to be
   * permanently invalid (e.g. app uninstalled), so callers can prune them.
   */
  sendPush(messages: PushMessage[]): Promise<string[]>;
}
