import { get, set } from 'idb-keyval';
import type { Conversation, Message } from '@example/types';

const CONVERSATIONS_KEY = 'conversations';
const MESSAGES_PREFIX = 'messages_';

export async function getConversations(): Promise<Conversation[]> {
  return (await get(CONVERSATIONS_KEY)) || [];
}

export async function saveConversation(conversation: Conversation): Promise<void> {
  const conversations = await getConversations();
  const index = conversations.findIndex(c => c.id === conversation.id);
  
  if (index >= 0) {
    conversations[index] = conversation;
  } else {
    conversations.push(conversation);
  }
  
  await set(CONVERSATIONS_KEY, conversations);
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  return (await get(`${MESSAGES_PREFIX}${conversationId}`)) || [];
}

export async function saveMessage(message: Message): Promise<void> {
  if (!message.conversationId) return;
  
  const messages = await getMessages(message.conversationId);
  messages.push(message);
  await set(`${MESSAGES_PREFIX}${message.conversationId}`, messages);
}

export async function deleteConversation(id: string): Promise<void> {
  const conversations = await getConversations();
  const filtered = conversations.filter(c => c.id !== id);
  await set(CONVERSATIONS_KEY, filtered);
  await set(`${MESSAGES_PREFIX}${id}`, []);
}
