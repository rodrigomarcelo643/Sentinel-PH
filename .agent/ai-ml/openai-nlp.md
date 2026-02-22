# OpenAI NLP Service

## Overview

Uses OpenAI GPT-3.5-turbo for observation categorization and spam detection.

## Location
`src/services/openAiService/index.ts`

## Functions

### 1. Observation Categorization

Automatically categorizes free-text observations into predefined health observation types.

#### Categories
- `medication_purchase` - Increased medicine/paracetamol sales
- `illness_mention` - People mentioning symptoms or illness
- `absence_pattern` - Children/adults absent from usual activities
- `environmental_concern` - Water quality, sanitation, flooding
- `other` - Doesn't fit predefined categories

#### Implementation

```typescript
export const categorizeObservation = async (observationText: string): Promise<string> => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
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
      temperature: 0.3, // Low temperature for consistency
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
};
```

#### Example Usage

```typescript
const category = await categorizeObservation(
  "Maraming bumibili ng bioflu sa tindahan ngayong linggo"
);
// Returns: "medication_purchase"
```

### 2. Spam Detection

Identifies malicious, inappropriate, or spam content in observations.

#### Detection Criteria
- Offensive language
- Irrelevant content (not health-related)
- Promotional/advertising content
- Repetitive nonsense text
- Personal attacks or harassment

#### Implementation

```typescript
export const detectSpam = async (observationText: string): Promise<boolean> => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
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
      temperature: 0.1, // Very low for binary classification
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content.toLowerCase().includes('true');
};
```

#### Example Usage

```typescript
const isSpam = await detectSpam("Buy cheap medicine now! Click here!");
// Returns: true

const isSpam = await detectSpam("May mga bata na may lagnat sa purok 3");
// Returns: false
```

## API Configuration

### Environment Variable
```env
VITE_OPENAI_API_KEY=sk-...
```

### Model Selection
- **Model**: `gpt-3.5-turbo`
- **Reason**: Cost-effective, fast, sufficient for categorization tasks
- **Alternative**: `gpt-4` for higher accuracy (higher cost)

### Temperature Settings
- **Categorization**: 0.3 (some creativity, but consistent)
- **Spam Detection**: 0.1 (very deterministic)

## Error Handling

```typescript
try {
  const category = await categorizeObservation(text);
} catch (error) {
  console.error('OpenAI categorization error:', error);
  // Fallback to 'other' category
  return 'other';
}
```

## Rate Limiting & Costs

### OpenAI API Limits
- **Free Tier**: $5 credit (expires after 3 months)
- **Paid Tier**: Pay-as-you-go

### Cost Estimation
- **GPT-3.5-turbo**: ~$0.002 per 1K tokens
- **Average observation**: ~50 tokens
- **Cost per observation**: ~$0.0001 (₱0.0056)

### Monthly Cost Projection
```
1,000 observations/month × ₱0.0056 = ₱5.60/month
10,000 observations/month × ₱0.0056 = ₱56/month
```

## Optimization Strategies

1. **Caching**: Cache common observation patterns
2. **Batch Processing**: Process multiple observations in one request
3. **Fallback**: Use rule-based categorization for simple cases
4. **Rate Limiting**: Limit API calls during high traffic

## Future Enhancements

1. **Fine-tuned Model**: Train custom model on Filipino health observations
2. **Local NLP**: Use lightweight models (BERT, DistilBERT) for offline capability
3. **Multi-language Support**: Detect and process Tagalog, Cebuano, Ilocano
4. **Sentiment Analysis**: Detect urgency/severity in observations
5. **Entity Extraction**: Extract symptoms, locations, time references
