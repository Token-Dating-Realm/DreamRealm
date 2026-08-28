"use client";

import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useRef, useState } from "react";

interface HCaptchaWidgetProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

const SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

export function HCaptchaWidget({
  onVerify,
  onError,
  onExpire,
}: HCaptchaWidgetProps) {
  const ref = useRef<InstanceType<typeof HCaptcha>>(null);
  const [error, setError] = useState<string | null>(null);

  if (!SITE_KEY) {
    return (
      <div className="rounded-lg border border-warning bg-warning/10 px-4 py-3 text-sm text-warning">
        CAPTCHA not configured. Please set NEXT_PUBLIC_HCAPTCHA_SITE_KEY.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <HCaptcha
        ref={ref}
        sitekey={SITE_KEY}
        onVerify={(token) => {
          setError(null);
          onVerify(token);
        }}
        onError={() => {
          setError("CAPTCHA verification failed. Please try again.");
          onError?.();
          ref.current?.resetCaptcha();
        }}
        onExpire={() => {
          setError("CAPTCHA expired. Please verify again.");
          onExpire?.();
          ref.current?.resetCaptcha();
        }}
      />
      {error && (
        <p className="text-sm text-danger">{error}</p>
      )}
    </div>
  );
}
