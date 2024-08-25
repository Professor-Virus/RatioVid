import { NextResponse } from 'next/server';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import axios from 'axios';
import path from 'path';

const frameRate = 1; // Extract 1 frame per second
const frameDir = path.join(process.cwd(), 'temp_frames');
const interestingFramesDir = path.join(process.cwd(), 'interesting_frames');

async function extractFrames(videoPath) {
    if (!fs.existsSync(frameDir)) {
        fs.mkdirSync(frameDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .on('end', resolve)
            .on('error', reject)
            .outputOptions('-vf', `fps=${frameRate}`)
            .output(`${frameDir}/%04d.jpg`)
            .run();
    });
}

async function analyzeFrame(framePath, prompt) {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-4-vision-preview",
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: prompt },
                    { type: "image_url", image_url: { url: `data:image/jpeg;base64,${fs.readFileSync(framePath, 'base64')}` } }
                ]
            }
        ],
        max_tokens: 300
    }, {
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        }
    });

    return response.data.choices[0].message.content;
}

function isInteresting(analysisResult, prompt) {
    // Implement your logic here to determine if the frame is interesting
    return analysisResult.toLowerCase().includes('interesting') || analysisResult.toLowerCase().includes(prompt.toLowerCase());
}

export async function POST(req) {
    try {
        const { videoPath, prompt } = await req.json();

        if (!videoPath || !prompt) {
            return NextResponse.json({ message: 'Video path and prompt are required' }, { status: 400 });
        }

        // Create directory for interesting frames
        if (!fs.existsSync(interestingFramesDir)) {
            fs.mkdirSync(interestingFramesDir, { recursive: true });
        }

        // Extract frames from the video
        await extractFrames(videoPath);

        const frames = fs.readdirSync(frameDir);
        const interestingFrames = [];

        for (const frame of frames) {
            const framePath = path.join(frameDir, frame);
            const result = await analyzeFrame(framePath, prompt);

            if (isInteresting(result, prompt)) {
                const interestingFramePath = path.join(interestingFramesDir, frame);
                fs.copyFileSync(framePath, interestingFramePath);
                interestingFrames.push(interestingFramePath);
            }

            // Clean up the original frame after analysis
            fs.unlinkSync(framePath);
        }

        // Clean up the temporary directory
        fs.rmdirSync(frameDir);

        // Return the paths of interesting frames
        return NextResponse.json({ interestingFrames });
    } catch (error) {
        console.error('Error processing video:', error);
        return NextResponse.error('Internal server error', 500);
    }
}