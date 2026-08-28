// apps/web/src/app/api/verify-turnstile/route.ts
// Server-side hCaptcha token verification
// Validates CAPTCHA tokens before allowing sensitive auth actions.

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const HCAPTCHA_VERIFY_URL = "https://api.hcaptcha.com/siteverify";

interface HCaptchaVerifyRequest {
  token: string;
}

const SECRET_KEY = process.env.HCAPTCHA_SECRET_KEY;

export async function POST(req: NextRequest) {
  if (!SECRET_KEY) {
    return NextResponse.json(
      { error: "Server CAPTCHA misconfiguration" },
      { status: 500 }
    );
  }

  let body: HCaptchaVerifyRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { token } = body;
  if (!token || typeof token !== "string" || token.length < 10) {
    return NextResponse.json(
      { error: "Missing or invalid CAPTCHA token" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(HCAPTCHA_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: SECRET_KEY,
        response: token,
      }),
    });
    const outcome = await res.json();

    if (outcome.success === true) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      {
        success: false,
        error: "CAPTCHA verification failed",
      },
      { status: 403 }
    );
  } catch {
    return NextResponse.json(
      { error: "CAPTCHA verification service unavailable" },
      { status: 503 }
    );
  }
}
