import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

export function extractAudio(videoPath) {
  const audioPath = videoPath.replace(/\.[^/.]+$/, ".mp3");
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions('-vn')
      .outputOptions('-acodec', 'libmp3lame')
      .outputOptions('-ac', '2')
      .outputOptions('-ar', '44100')
      .outputOptions('-b:a', '128k')
      .output(audioPath)
      .on('end', () => resolve(audioPath))
      .on('error', reject)
      .run();
  });
}

export function extractFrames(videoPath, frameDir, frameRate = 1) {
  if (!fs.existsSync(frameDir)) {
    fs.mkdirSync(frameDir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions('-vf', `fps=${frameRate}`)
      .output(path.join(frameDir, '%04d.jpg'))
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}

export function extractVideoSegment(videoPath, start, end) {
  const outputPath = `${videoPath}_segment_${start}_${end}.mp4`;
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .setStartTime(start)
      .setDuration(end - start)
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .run();
  });
}