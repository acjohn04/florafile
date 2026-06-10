import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/storage";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const resolvedParams = await params;
  const key = resolvedParams.key.join("/");
  const client = getClient();
  const bucketName = process.env.AWS_S3_BUCKET_NAME!;

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const response = await client.send(command);

    const bodyStream = response.Body?.transformToWebStream
      ? response.Body.transformToWebStream()
      : (response.Body as ReadableStream);

    return new NextResponse(bodyStream, {
      headers: {
        "Content-Type": response.ContentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: unknown) {
    console.error(`Error fetching S3 object (key: ${key}):`, error);
    if (error instanceof Error && error.name === "NoSuchKey") {
      return new NextResponse("Not Found", { status: 404 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
