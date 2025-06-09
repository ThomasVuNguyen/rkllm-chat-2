import { loadConfig } from './config';
import { Message } from '../types';

// Event handler type for streaming responses
export type StreamingEventHandler = {
  onToken: (token: string) => void;
  onComplete: (completeText: string) => void;
  onError: (error: Error) => void;
};

// Regular non-streaming version of sendMessage
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
  const finalUrl = 'http://100.65.35.72:8080/v1/completions';

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

/**
 * Send a message and receive a streaming response
 * @param content User message content
 * @param previousMessages Previous conversation messages
 * @param handlers Event handlers for streaming (onToken, onComplete, onError)
 */
export function sendMessageStreaming(
  content: string,
  previousMessages: Message[],
  handlers: StreamingEventHandler
): () => void {
  const config = loadConfig();
  if (!config.apiEndpoint) {
    handlers.onError(new Error('API endpoint not configured'));
    return () => {}; // Empty abort function
  }

  // Format messages same as non-streaming version
  const formattedMessages = [
    {
      role: 'system',
      content: 'You are a helpful assistant.'
    },
    ...previousMessages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role,
        content: msg.content
      })),
    {
      role: 'user',
      content
    }
  ];

  // Use the endpoint from config, avoid double /chat/completions
  let baseEndpoint = config.apiEndpoint.replace(/\/$/, '');
  let finalUrl: string;
  if (baseEndpoint.endsWith('/chat/completions')) {
    finalUrl = baseEndpoint;
  } else {
    finalUrl = `${baseEndpoint}/chat/completions`;
  }
  console.log('Making streaming API request to:', finalUrl);
  
  // Create AbortController to allow cancelling the request
  const controller = new AbortController();
  
  // Start the fetch request for streaming
  (async () => {
    try {
      const response = await fetch(finalUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey || 'sk-rkllm-api-key'}`
        },
        body: JSON.stringify({
          model: 'gpt-4.1', // model name per your Python sample
          messages: formattedMessages,
          stream: true
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        let errorText;
        try {
          const errorData = await response.json();
          errorText = JSON.stringify(errorData);
        } catch (e) {
          errorText = await response.text();
        }
        handlers.onError(new Error(`API request failed: ${errorText || response.statusText}`));
        return;
      }

      // Ensure we have a readable stream
      if (!response.body) {
        handlers.onError(new Error('Response body is null'));
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let completeText = '';

      // Process the stream
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });
        
        try {
          // Split the chunk by lines
          const lines = chunk
            .split('\n')
            .filter(line => line.trim() !== '');

          for (const line of lines) {
            // Each line should be in the format "data: {json}"
            if (line.startsWith('data: ')) {
              const data = line.slice(6); // Remove 'data: ' prefix
              
              // Check for the stream end marker
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                console.log('Streaming chunk received:', parsed);
                // Extract the content delta
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  completeText += content;
                  handlers.onToken(content);
                }
              } catch (e) {
                console.warn('Error parsing SSE chunk:', data, e);
              }
            }
          }
        } catch (e) {
          console.error('Error processing stream chunk:', e);
        }
      }
      
      // Call onComplete with the full text
      handlers.onComplete(completeText);
      
    } catch (error) {
      // Don't call onError if the request was aborted intentionally
      const isAbortError = typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'AbortError';
      if (!isAbortError) {
        console.error('Streaming error:', error);
        handlers.onError(error instanceof Error ? error : new Error(String(error)));
      }
    }
  })();
  
  // Return abort function
  return () => controller.abort();
}