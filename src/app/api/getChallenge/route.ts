import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

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
    // Sign the challenge as a JWT
    const challengeJwt = jwt.sign({ nonce, created }, JWT_SECRET, {
      expiresIn: "5m",
    });
    return NextResponse.json({ nonce, created, challengeJwt });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
