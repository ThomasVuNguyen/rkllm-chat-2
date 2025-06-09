import { loadConfig } from './config';
import { Message } from '../types';
export async function sendMessage(content: string, previousMessages: Message[]): Promise<string> {
  const config = loadConfig();
  if (!config.apiEndpoint) {
    throw new Error('API endpoint not configured');
  }
  // Format messages for OpenAI API
  const messages = previousMessages.filter(msg => msg.role !== 'system') // Filter out system messages
  .map(msg => ({
    role: msg.role,
    content: msg.content
  }));
  // Add the new user message
  messages.push({
    role: 'user',
    content
  });
  try {
    const response = await fetch(`${config.apiEndpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && {
          Authorization: `Bearer ${config.apiKey}`
        })
      },
      body: JSON.stringify({
        model: 'rkllm-local',
        messages,
        max_tokens: 500
      })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get response from API');
    }
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}