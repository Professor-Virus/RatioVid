import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

export async function uploadToS3(filePath) {
  const fileContent = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);

  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: fileContent
  };

  try {
    const data = await s3.upload(params).promise();
    return data.Location;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
}

export async function downloadFromS3(key) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key
  };

  try {
    const data = await s3.getObject(params).promise();
    const filePath = path.join('/tmp', key);
    fs.writeFileSync(filePath, data.Body);
    return filePath;
  } catch (error) {
    console.error('Error downloading from S3:', error);
    throw error;
  }
}