import { Mistral } from '@mistralai/mistralai';
import { modelCapabilitiesFromJSON } from '@mistralai/mistralai/models/components';

if (!process.env.MISTRAL_API_KEY) {
  throw new Error("Missing MISTRAL_API_KEY environment variable");
}

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { senderUsername, partnerUsername } = await request.json();

    if (!senderUsername || !partnerUsername) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const prompt = `Generate a cute and extreme  flirty message (max 400 characters) for a Valentine's card from ${senderUsername} to ${partnerUsername}.  Don't use hashtags.`;

    const result = await mistral.chat.complete({
      model: "mistral-large-latest",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = result.choices[0]?.message?.content;
    console.log(text);
    if (!text) {
      throw new Error('No response from Mistral');
    }

    return Response.json({ message: text });
  } catch (error) {
    console.error("Mistral generation error:", error);
    return Response.json(
      { error: 'Failed to generate message', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
