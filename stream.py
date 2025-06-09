import openai
# from api import *
client = openai.OpenAI(
    api_key='okie',
    base_url="http://100.65.35.72:8080/v1"
)

# Streaming chat completion
stream = client.chat.completions.create(
    model="gpt-4.1",
    messages=[{"role": "user", "content": "Tell me a story"}],
    stream=True  # Enable streaming
)

for chunk in stream:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="")