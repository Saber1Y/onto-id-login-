import { NextRequest, NextResponse } from "next/server";
import { challenges } from "../challengeStore";

export async function GET() {
  // Generate a unique challenge (nonce)
  const challenge = `Login request at ${Date.now()}`;
  return NextResponse.json({ challenge });
}

export async function POST(req: NextRequest) {
  try {
    const { authRequest } = await req.json();
    if (!authRequest) {
      return NextResponse.json(
        { error: "Missing authRequest" },
        { status: 400 }
      );
    }
    // Generate a unique nonce
    const nonce = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}`;
    const created = new Date().toISOString();
    challenges[nonce] = { nonce, created };
    // You can add more fields as needed for your flow
    return NextResponse.json({ nonce, created });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
