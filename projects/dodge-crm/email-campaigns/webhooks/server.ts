import express, { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const app = express();
app.use(express.json());

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Resend webhook signing secret
const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET!;

interface ResendWebhookPayload {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    // For click events
    click?: {
      link: string;
      timestamp: string;
      user_agent: string;
      ip_address: string;
    };
    // For bounce events
    bounce?: {
      message: string;
      type: string;
    };
    // For complaint events
    complaint?: {
      type: string;
      user_agent: string;
    };
  };
}

// Verify Resend webhook signature
function verifySignature(payload: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) return true; // Skip in dev
  
  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
  const digest = hmac.update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

// Main webhook handler
app.post("/webhooks/resend", async (req: Request, res: Response) => {
  const signature = req.headers["resend-signature"] as string;
  const payload = JSON.stringify(req.body);

  // Verify signature in production
  if (process.env.NODE_ENV === "production" && !verifySignature(payload, signature)) {
    console.error("Invalid webhook signature");
    return res.status(401).json({ error: "Invalid signature" });
  }

  const event = req.body as ResendWebhookPayload;
  const { type, data } = event;

  console.log(`[Webhook] Received: ${type} for ${data.email_id}`);

  try {
    switch (type) {
      case "email.sent":
        await handleSent(data);
        break;

      case "email.delivered":
        await handleDelivered(data);
        break;

      case "email.opened":
        await handleOpened(data);
        break;

      case "email.clicked":
        await handleClicked(data);
        break;

      case "email.bounced":
        await handleBounced(data);
        break;

      case "email.complained":
        await handleComplaint(data);
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error(`[Webhook] Error processing ${type}:`, error);
    res.status(500).json({ error: "Processing failed" });
  }
});

// Event handlers
async function handleSent(data: ResendWebhookPayload["data"]) {
  await supabase
    .from("email_sends")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
    })
    .eq("resend_id", data.email_id);
}

async function handleDelivered(data: ResendWebhookPayload["data"]) {
  await supabase
    .from("email_sends")
    .update({
      status: "delivered",
      delivered_at: new Date().toISOString(),
    })
    .eq("resend_id", data.email_id);
}

async function handleOpened(data: ResendWebhookPayload["data"]) {
  const now = new Date().toISOString();
  
  // Update send record
  await supabase
    .from("email_sends")
    .update({
      status: "opened",
      opened_at: now,
      open_count: supabase.rpc("increment_open_count"),
    })
    .eq("resend_id", data.email_id);

  // Log open event
  await supabase.from("email_events").insert({
    resend_id: data.email_id,
    event_type: "open",
    occurred_at: now,
  });
}

async function handleClicked(data: ResendWebhookPayload["data"]) {
  const now = new Date().toISOString();
  
  // Update send record
  await supabase
    .from("email_sends")
    .update({
      status: "clicked",
      clicked_at: now,
    })
    .eq("resend_id", data.email_id);

  // Log click event with details
  await supabase.from("email_events").insert({
    resend_id: data.email_id,
    event_type: "click",
    occurred_at: now,
    metadata: {
      link: data.click?.link,
      user_agent: data.click?.user_agent,
      ip_address: data.click?.ip_address,
    },
  });
}

async function handleBounced(data: ResendWebhookPayload["data"]) {
  const now = new Date().toISOString();
  const recipient = data.to[0];

  // Update send record
  await supabase
    .from("email_sends")
    .update({
      status: "bounced",
      bounced_at: now,
      bounce_type: data.bounce?.type,
      bounce_message: data.bounce?.message,
    })
    .eq("resend_id", data.email_id);

  // Mark email as invalid in companies table
  await supabase
    .from("companies")
    .update({
      email_valid: false,
      email_bounce_reason: data.bounce?.message,
    })
    .eq("email", recipient);

  // Add to suppression list
  await supabase.from("email_suppressions").upsert({
    email: recipient,
    reason: "bounce",
    bounce_type: data.bounce?.type,
    suppressed_at: now,
  });
}

async function handleComplaint(data: ResendWebhookPayload["data"]) {
  const now = new Date().toISOString();
  const recipient = data.to[0];

  // Update send record
  await supabase
    .from("email_sends")
    .update({
      status: "complained",
      complained_at: now,
    })
    .eq("resend_id", data.email_id);

  // Add to suppression list (complaints are serious!)
  await supabase.from("email_suppressions").upsert({
    email: recipient,
    reason: "complaint",
    suppressed_at: now,
  });

  // Update company record
  await supabase
    .from("companies")
    .update({
      do_not_email: true,
      unsubscribed_at: now,
    })
    .eq("email", recipient);

  console.warn(`[COMPLAINT] ${recipient} filed spam complaint`);
}

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Unsubscribe handler
app.get("/unsubscribe/:token", async (req: Request, res: Response) => {
  const { token } = req.params;
  
  try {
    // Decode token to get email (token = base64(email))
    const email = Buffer.from(token, "base64url").toString();
    
    await supabase.from("email_suppressions").upsert({
      email,
      reason: "unsubscribe",
      suppressed_at: new Date().toISOString(),
    });

    await supabase
      .from("companies")
      .update({
        do_not_email: true,
        unsubscribed_at: new Date().toISOString(),
      })
      .eq("email", email);

    res.send(`
      <html>
        <body style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h1>You've been unsubscribed</h1>
          <p>You won't receive any more emails from us.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Unsubscribe error:", error);
    res.status(400).send("Invalid unsubscribe link");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[Webhook Server] Running on port ${PORT}`);
});
