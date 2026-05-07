import { Context } from "hono";
import { normalizeMobileNumber } from "@/lib/phone-normalizer";
import { sendSms } from "@/lib/twilio";

export async function handleSendTestSms(c: Context) {
  const { message, recipients } = c.req.valid("json" as never) as {
    message: string;
    recipients: string[];
  };
  const results = [];

  for (const phone of recipients) {
    const norm = normalizeMobileNumber(phone);
    if (!norm.isValid || !norm.formattedNumber) {
      results.push({
        phone,
        success: false,
        error: norm.error || "Numéro invalide",
      });
      continue;
    }
    const result = await sendSms({ to: norm.formattedNumber, body: message });
    results.push({
      phone: norm.formattedNumber,
      success: result.success,
      error: result.error,
    });
  }

  return c.json({ success: true, data: results });
}
