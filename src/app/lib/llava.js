import axios from 'axios';
import fs from 'fs';

export async function analyzeFrameWithLLAVA(framePath, prompt) {
  const image = fs.readFileSync(framePath);
  const base64Image = Buffer.from(image).toString('base64');

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/llava-hf/llava-1.5-7b-hf',
      {
        inputs: {
          image: base64Image,
          prompt: prompt
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data[0].generated_text;
  } catch (error) {
    console.error('Error analyzing frame with LLAVA:', error);
    throw error;
  }
}