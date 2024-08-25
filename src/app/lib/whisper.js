import axios from 'axios';
import fs from 'fs';

export async function transcribeAudio(audioPath) {
  const audio = fs.readFileSync(audioPath);
  const base64Audio = Buffer.from(audio).toString('base64');

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/openai/whisper-large-v3',
      {
        inputs: base64Audio
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}