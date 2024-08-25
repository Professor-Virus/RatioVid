import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { extractAudio, extractFrames, extractVideoSegment } from '../../lib/ffmpeg';
import { analyzeFrameWithLLAVA } from '../../lib/llava';
import { transcribeAudio } from '../../lib/whisper';
import { uploadToS3, downloadFromS3 } from '../../lib/s3';
import { updateVideoMetadata } from '../../lib/mongodb';

const frameDir = path.join(process.cwd(), 'temp_frames');
const frameRate = 1; // Extract 1 frame per second

export async function POST(req) {
    try {
        const { videoUrl, prompt } = await req.json();

        if (!videoUrl || !prompt) {
            return NextResponse.json({ message: 'Video URL and prompt are required' }, { status: 400 });
        }

        // Download video from S3 or URL
        const videoPath = await downloadFromS3(videoUrl);

        // Extract audio from video
        const audioPath = await extractAudio(videoPath);

        // Transcribe audio
        const transcription = await transcribeAudio(audioPath);

        // Extract frames from video
        await extractFrames(videoPath, frameDir, frameRate);

        const frames = fs.readdirSync(frameDir);
        const frameAnalysis = [];

        for (const frame of frames) {
            const framePath = path.join(frameDir, frame);
            const result = await analyzeFrameWithLLAVA(framePath, prompt);
            frameAnalysis.push({ frame, result });

            // Clean up the original frame after analysis
            fs.unlinkSync(framePath);
        }

        // Find relevant segments based on frame analysis and transcription
        const relevantSegments = findRelevantSegments(frameAnalysis, transcription, prompt);

        // Extract relevant video segments
        const snippets = await Promise.all(relevantSegments.map(segment => 
            extractVideoSegment(videoPath, segment.start, segment.end)
        ));

        // Upload snippets to S3
        const uploadedSnippets = await Promise.all(snippets.map(uploadToS3));

        // Update metadata in MongoDB
        await updateVideoMetadata(videoUrl, {
            prompt,
            snippets: uploadedSnippets,
            transcription
        });

        // Clean up temporary files
        fs.unlinkSync(videoPath);
        fs.unlinkSync(audioPath);
        fs.rmdirSync(frameDir, { recursive: true });

        return NextResponse.json({ snippets: uploadedSnippets });
    } catch (error) {
        console.error('Error processing video:', error);
        return NextResponse.json({ message: 'Internal server error', details: error.message }, { status: 500 });
    }
}

function findRelevantSegments(frameAnalysis, transcription, prompt) {
    const relevantSegments = [];
    const words = prompt.toLowerCase().split(' ');

    frameAnalysis.forEach((frame, index) => {
        const isVisuallyRelevant = words.some(word => frame.result.toLowerCase().includes(word));
        const isAudioRelevant = words.some(word => transcription.slice(index * 5, (index + 1) * 5).toLowerCase().includes(word));

        if (isVisuallyRelevant || isAudioRelevant) {
            relevantSegments.push({
                start: index / frameRate,
                end: (index + 1) / frameRate
            });
        }
    });

    // Merge adjacent segments
    return mergeAdjacentSegments(relevantSegments);
}

function mergeAdjacentSegments(segments) {
    if (segments.length <= 1) return segments;

    const mergedSegments = [segments[0]];

    for (let i = 1; i < segments.length; i++) {
        const currentSegment = segments[i];
        const lastMergedSegment = mergedSegments[mergedSegments.length - 1];

        if (currentSegment.start <= lastMergedSegment.end) {
            lastMergedSegment.end = Math.max(lastMergedSegment.end, currentSegment.end);
        } else {
            mergedSegments.push(currentSegment);
        }
    }

    return mergedSegments;
}
