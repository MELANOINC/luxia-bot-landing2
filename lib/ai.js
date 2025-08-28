import OpenAI from 'openai';

const client = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

/**
 * Generate a personalized follow-up message for a lead using OpenAI.
 * @param {object} leadData - Information captured from the lead form.
 * @returns {Promise<string>} Generated follow-up message.
 */
export async function generateLeadSummary(leadData = {}) {
  if (!client) {
    // Fallback when OpenAI is not configured
    return `Nuevo lead recibido: ${leadData.fullName || 'Cliente'} - ${leadData.email || 'Sin email'} - Perfil: ${leadData.investorProfile || 'No especificado'}`;
  }

  const prompt = `You are a helpful assistant for a real estate CRM. Generate a short, friendly follow-up message summarizing this lead data:\n${JSON.stringify(leadData)}`;
  
  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You craft concise follow-up messages for real estate leads.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 100
    });
    return response.choices?.[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.warn('OpenAI API error, using fallback:', error.message);
    return `Nuevo lead recibido: ${leadData.fullName || 'Cliente'} - ${leadData.email || 'Sin email'} - Perfil: ${leadData.investorProfile || 'No especificado'}`;
  }
}
