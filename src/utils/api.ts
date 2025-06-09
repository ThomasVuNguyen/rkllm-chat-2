import { loadConfig } from './config';
import { Message } from '../types';

export async function sendMessage(content: string, previousMessages: Message[]): Promise<string> {
  const config = loadConfig();
  if (!config.apiEndpoint) {
    throw new Error('API endpoint not configured');
  }

  // Format messages for OpenAI API - similar to Python client
  const formattedMessages = [
    // Add a system message like in the Python client
    {
      role: 'system',
      content: 'You are a helpful assistant.'
    },
    // Add conversation history (excluding system messages)
    ...previousMessages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role,
        content: msg.content
      })),
    // Add the new user message
    {
      role: 'user',
      content
    }
  ];

  // TEMPORARY FIX: Hardcode the exact URL that works in the Python client
  // This bypasses any localStorage or configuration issues
  const finalUrl = 'http://100.65.35.72:8080/v1/chat/completions';

  // Log the request details for debugging
  console.log('Making API request to:', finalUrl);
  console.log('With payload:', {
    model: 'gpt-4.1', // Match the model name in the Python client
    messages: formattedMessages,
  });

  try {
    const response = await fetch(finalUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey || 'sk-rkllm-api-key'}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1', // Match the model name in the Python client
        messages: formattedMessages,
        // Removed max_tokens to match Python client which doesn't specify it
      })
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      let errorText;
      try {
        const errorData = await response.json();
        errorText = JSON.stringify(errorData);
      } catch (e) {
        errorText = await response.text();
      }
      console.error('API error response:', errorText);
      throw new Error(`API request failed: ${errorText || response.statusText}`);
    }

    const data = await response.json();
    console.log('API response data:', data);
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling API:', error);
    throw error;
  }
}