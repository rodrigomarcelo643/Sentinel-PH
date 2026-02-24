import axios from 'axios';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const openaiClient = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
  },
});

export const categorizeObservation = async (observationText: string): Promise<string> => {
  try {
    const { data } = await openaiClient.post('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Categorize health observations into: medication_purchase, illness_mention, absence_pattern, environmental_concern, or other.',
        },
        {
          role: 'user',
          content: observationText,
        },
      ],
      temperature: 0.3,
    });
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI categorization error:', error);
    return 'other';
  }
};

export const detectSpam = async (observationText: string): Promise<boolean> => {
  try {
    const { data } = await openaiClient.post('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Determine if this health observation is spam, malicious, or inappropriate. Respond with only "true" or "false".',
        },
        {
          role: 'user',
          content: observationText,
        },
      ],
      temperature: 0.1,
    });
    return data.choices[0].message.content.toLowerCase().includes('true');
  } catch (error) {
    console.error('OpenAI spam detection error:', error);
    return false;
  }
};
