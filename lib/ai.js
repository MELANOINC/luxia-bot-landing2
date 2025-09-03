import OpenAI from 'openai';



/**
 * Generate a personalized follow-up message for a lead using OpenAI.
 * @param {object} leadData - Information captured from the lead form.
 * @returns {Promise<string>} Generated follow-up message.
 */
export async function generateLeadSummary(leadData = {}) {

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
