interface Config {
  apiEndpoint: string;
  apiKey: string;
}
const CONFIG_KEY = 'ai_chat_config';
export function saveConfig(config: Config): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}
export function loadConfig(): Config {
  const savedConfig = localStorage.getItem(CONFIG_KEY);
  if (savedConfig) {
    try {
      return JSON.parse(savedConfig) as Config;
    } catch (e) {
      return {
        apiEndpoint: 'http://100.65.35.72:8080/v1',
        apiKey: 'sk-rkllm-api-key'
      };
    }
  }
  return {
    apiEndpoint: 'http://100.65.35.72:8080/v1',
    apiKey: 'sk-rkllm-api-key'
  };
}