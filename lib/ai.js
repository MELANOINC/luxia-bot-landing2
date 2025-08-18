import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate a personalized follow-up message for a lead using OpenAI.
 * @param {object} leadData - Information captured from the lead form.
 * @returns {Promise<string>} Generated follow-up message.
 */
export async function generateLeadSummary(leadData = {}) {
  const prompt = `You are a helpful assistant for a real estate CRM. Generate a short, friendly follow-up message summarizing this lead data:\n${JSON.stringify(leadData)}`;
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You craft concise follow-up messages for real estate leads.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 100
  });
  return response.choices?.[0]?.message?.content?.trim() || '';
}
