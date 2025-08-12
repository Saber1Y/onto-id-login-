import { NextResponse } from "next/server";

// This would normally use ONT's SDK to verify the signature
export async function POST(req: Request) {
  const { signature } = await req.json();

  // Fake verification logic
  if (signature && signature.startsWith("ONT_SIGNATURE")) {
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false });
}