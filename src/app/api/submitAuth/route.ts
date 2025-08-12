import { NextRequest, NextResponse } from "next/server";
import { challenges } from "../challengeStore";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const authResponse = await req.json();
    if (!authResponse || !authResponse.nonce || !authResponse.proof) {
      return NextResponse.json(
        { error: "Invalid authentication response" },
        { status: 400 }
      );
    }
    const { nonce, proof } = authResponse;
    // Verify the challenge exists
    const challenge = challenges[nonce];
    if (!challenge) {
      return NextResponse.json(
        { error: "Invalid or expired challenge" },
        { status: 400 }
      );
    }
    // Verify the signature (placeholder logic, replace with actual verification)
    const isValidSignature = verifySignature(proof.value, challenge.nonce);
    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    // Invalidate the challenge
    delete challenges[nonce];
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
