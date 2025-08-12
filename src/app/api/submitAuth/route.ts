import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

export async function POST(req: NextRequest) {
  try {
    const authResponse = await req.json();
    if (
      !authResponse ||
      !authResponse.nonce ||
      !authResponse.proof ||
      !authResponse.challengeJwt
    ) {
      return NextResponse.json(
        { error: "Invalid authentication response" },
        { status: 400 }
      );
    }
    const { nonce, proof, challengeJwt } = authResponse;
    // Verify the challenge JWT
    let payload: any;
    try {
      payload = jwt.verify(challengeJwt, JWT_SECRET);
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired challenge token" },
        { status: 400 }
      );
    }
    if (payload.nonce !== nonce) {
      return NextResponse.json(
        { error: "Challenge nonce mismatch" },
        { status: 400 }
      );
    }
    // Verify the signature (placeholder logic, replace with actual verification)
    const isValidSignature = verifySignature(proof.value, nonce);
    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    // Generate a secure token (e.g., JWT, placeholder logic)
    const token = {
      token: crypto.randomBytes(32).toString("hex"),
      message: "Authentication successful",
    };
    return NextResponse.json(token);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

function verifySignature(signature: string, message: string): boolean {
  // Placeholder for actual signature verification logic
  // Use cryptographic libraries to verify the signature against the message
  return true;
}
