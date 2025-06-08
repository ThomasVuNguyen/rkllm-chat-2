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
        apiEndpoint: '',
        apiKey: ''
      };
    }
  }
  return {
    apiEndpoint: '',
    apiKey: ''
  };
}