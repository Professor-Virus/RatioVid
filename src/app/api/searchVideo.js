import { NextResponse } from 'next/server';
import { processVideo } from './processVideo';

export async function POST(req) {
    const { videoUrl, searchPrompt } = await req.json();
    
    try {
        const snippets = await processVideo(videoUrl, searchPrompt);
        return NextResponse.json({ snippets });
    } catch (error) {
        console.error('Error searching video:', error);
        return NextResponse.error('Internal server error', 500);
    }
}