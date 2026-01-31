const OPENAI_API_KEY = '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';

if (!OPENAI_API_KEY) {
  throw new Error("OpenAI API key not found in env");
}

export async function fetchImmunityResult(promptText: string) {
  if (!promptText) {
    throw new Error("Prompt is empty or undefined");
  }

  const response = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer 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`,
      },
      body: JSON.stringify({ 
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a wellness assistant. Do not diagnose diseases.",
          },
          {
            role: "user",
            content: promptText,
          },
        ],
        temperature: 0.4,
      }),
    }
  );

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  if (!data.choices?.[0]?.message?.content) {
    throw new Error("Invalid OpenAI response");
  }

  return data.choices[0].message.content;
}
