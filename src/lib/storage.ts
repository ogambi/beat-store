import crypto from "node:crypto";
import { env } from "@/lib/env";

type PresignedUpload = {
  key: string;
  url: string;
  method: "PUT";
  headers: Record<string, string>;
};

// Minimal S3-compatible pre-signed PUT URL generator.
export function createPresignedPutUrl(params: {
  key: string;
  contentType: string;
  expiresInSeconds?: number;
}): PresignedUpload {
  const service = "s3";
  const region = env.storageRegion;
  const host = new URL(env.storageEndpoint).host;
  const method = "PUT";
  const expires = params.expiresInSeconds ?? 600;

  const now = new Date();
  const amzDate = toAmzDate(now);
  const shortDate = amzDate.slice(0, 8);
  const credentialScope = `${shortDate}/${region}/${service}/aws4_request`;

  const canonicalUri = `/${env.storageBucket}/${params.key}`;

  const query = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${env.storageAccessKeyId}/${credentialScope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expires),
    "X-Amz-SignedHeaders": "host"
  });

  const canonicalHeaders = `host:${host}\n`;
  const signedHeaders = "host";
  const payloadHash = "UNSIGNED-PAYLOAD";
  const canonicalRequest = [
    method,
    canonicalUri,
    query.toString(),
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256(canonicalRequest)
  ].join("\n");

  const signature = hmacHex(getSigningKey(shortDate, region, service), stringToSign);
  query.set("X-Amz-Signature", signature);

  return {
    key: params.key,
    url: `${env.storageEndpoint}${canonicalUri}?${query.toString()}`,
    method,
    headers: {
      "Content-Type": params.contentType
    }
  };
}

export async function getObjectDownloadUrl(key: string): Promise<string> {
  // For private buckets, build a signed URL through your CDN or provider SDK.
  // This starter returns direct object URL. Lock down bucket as needed.
  return `${env.storageEndpoint}/${env.storageBucket}/${key}`;
}

function toAmzDate(d: Date): string {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mi = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}T${hh}${mi}${ss}Z`;
}

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function hmac(key: Buffer | string, value: string): Buffer {
  return crypto.createHmac("sha256", key).update(value).digest();
}

function hmacHex(key: Buffer | string, value: string): string {
  return crypto.createHmac("sha256", key).update(value).digest("hex");
}

function getSigningKey(dateStamp: string, region: string, service: string): Buffer {
  const kDate = hmac(`AWS4${env.storageSecretAccessKey}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, "aws4_request");
}
