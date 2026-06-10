import { S3Client, PutBucketPolicyCommand } from "@aws-sdk/client-s3";
import { config } from "dotenv";

config({ path: ".env" });

const client = new S3Client({
  endpoint: process.env.AWS_ENDPOINT_URL,
  region: process.env.AWS_DEFAULT_REGION ?? "auto",
  forcePathStyle: true,
});

const bucketName = process.env.AWS_S3_BUCKET_NAME!;

const policy = {
  Version: "2012-10-17",
  Statement: [
    {
      Sid: "PublicReadGetObject",
      Effect: "Allow",
      Principal: "*",
      Action: "s3:GetObject",
      Resource: `arn:aws:s3:::${bucketName}/*`,
    },
  ],
};

async function main() {
  try {
    await client.send(
      new PutBucketPolicyCommand({
        Bucket: bucketName,
        Policy: JSON.stringify(policy),
      })
    );
    console.log("Bucket policy updated successfully.");
  } catch (err) {
    console.error("Failed to update bucket policy:", err);
  }
}

main();
