import { api } from '../../lib/api';

export interface AinoAction { type: string; label: string; [k: string]: any; }
export interface AinoReply { reply: string; actions: AinoAction[]; }

/**
 * Sends the conversation to the backend Aino proxy.
 * The backend builds the system prompt + data snapshot server-side,
 * calls the model, and returns parsed { reply, actions }.
 * Never call the Anthropic API directly from the browser.
 */
export async function sendToAino(
  messages: { role: string; content: string }[],
  lang: 'de' | 'en',
): Promise<AinoReply> {
  return api<AinoReply>('/aino/chat', {
    method: 'POST',
    body: JSON.stringify({ messages, lang }),
  });
}