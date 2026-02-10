import { NextResponse } from "next/server";
import { getBrokermaticClient } from "@/lib/brokermatic/client";

export async function POST() {
  // In production: accept file upload, get upload URL, upload to S3, then parse
  // For prototype: use mock parser directly
  const client = getBrokermaticClient();

  const uploadResult = await client.getUploadUrl("certificate.pdf");
  const parseResult = await client.parseCertificate(uploadResult.storageKey);

  return NextResponse.json({
    storageKey: uploadResult.storageKey,
    ...parseResult,
  });
}
