import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { render } from "@react-email/render";
import InitialOutreach from "../emails/initial-outreach.js";
import FollowupCaseStudy from "../emails/followup-case-study.js";
import FollowupBreakup from "../emails/followup-breakup.js";

// Initialize clients
const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Rate limiting config
const RATE_LIMIT = {
  perHour: 100,      // Start conservative
  perDay: 3000,      // Resend free tier
  delayMs: 36000,    // 36 seconds between emails = 100/hour
  batchSize: 10,     // Process 10 at a time
};

// Campaign sequence
const SEQUENCES = {
  initial: {
    template: InitialOutreach,
    subject: (data: any) => `${data.projectCount} commercial projects near ${data.companyName}`,
    delayDays: 0,
  },
  followup1: {
    template: FollowupCaseStudy,
    subject: () => "How Martinez Construction won $2.4M in new bids",
    delayDays: 3,
  },
  followup2: {
    template: FollowupBreakup,
    subject: (data: any) => `Closing the loop on ${data.companyName}`,
    delayDays: 7,
  },
};

type SequenceStep = keyof typeof SEQUENCES;

interface Company {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string;
  region: string | null;
  project_count: number;
}

interface SendResult {
  success: boolean;
  companyId: string;
  resendId?: string;
  error?: string;
}

// Generate unsubscribe URL
function getUnsubscribeUrl(email: string): string {
  const token = Buffer.from(email).toString("base64url");
  const baseUrl = process.env.WEBHOOK_BASE_URL || "http://localhost:3000";
  return `${baseUrl}/unsubscribe/${token}`;
}

// Check if email is suppressed
async function isEmailSuppressed(email: string): Promise<boolean> {
  const { data } = await supabase
    .from("email_suppressions")
    .select("email")
    .eq("email", email)
    .single();
  
  return !!data;
}

// Get eligible companies for a sequence step
async function getEligibleCompanies(
  step: SequenceStep,
  limit: number
): Promise<Company[]> {
  if (step === "initial") {
    // Companies that haven't received any email
    const { data, error } = await supabase
      .from("companies")
      .select("id, company_name, contact_name, email, region, project_count")
      .eq("email_valid", true)
      .eq("do_not_email", false)
      .is("last_email_sent", null)
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // For follow-ups, find companies at previous step
  const prevStep = step === "followup1" ? "initial" : "followup1";
  const delayDays = SEQUENCES[step].delayDays;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - delayDays);

  const { data, error } = await supabase
    .from("companies")
    .select("id, company_name, contact_name, email, region, project_count")
    .eq("email_valid", true)
    .eq("do_not_email", false)
    .eq("campaign_step", prevStep)
    .lt("last_email_sent", cutoffDate.toISOString())
    // Don't follow up if they've engaged
    .is("last_opened_at", null)
    .is("last_clicked_at", null)
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// Send a single email
async function sendEmail(
  company: Company,
  step: SequenceStep
): Promise<SendResult> {
  const sequence = SEQUENCES[step];
  
  // Check suppression list
  if (await isEmailSuppressed(company.email)) {
    console.log(`[Skip] ${company.email} is suppressed`);
    return { success: false, companyId: company.id, error: "suppressed" };
  }

  const templateData = {
    companyName: company.company_name,
    contactName: company.contact_name || "there",
    projectCount: company.project_count || 25,
    region: company.region || "your area",
  };

  // Render email HTML
  const html = await render(sequence.template(templateData));
  const subject = sequence.subject(templateData);

  // Replace unsubscribe placeholder
  const unsubscribeUrl = getUnsubscribeUrl(company.email);
  const finalHtml = html.replace(/\{\{unsubscribe_url\}\}/g, unsubscribeUrl);

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || "Dodge Network <leads@resend.dev>",
      to: company.email,
      subject,
      html: finalHtml,
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
      tags: [
        { name: "campaign", value: "dodge-outreach" },
        { name: "step", value: step },
        { name: "company_id", value: company.id },
      ],
    });

    if (error) {
      throw error;
    }

    // Record send in database
    await supabase.from("email_sends").insert({
      company_id: company.id,
      resend_id: data?.id,
      email: company.email,
      campaign_step: step,
      subject,
      status: "pending",
      created_at: new Date().toISOString(),
    });

    // Update company record
    await supabase
      .from("companies")
      .update({
        campaign_step: step,
        last_email_sent: new Date().toISOString(),
        email_send_count: supabase.rpc("increment_send_count"),
      })
      .eq("id", company.id);

    console.log(`[Sent] ${step} → ${company.email} (${data?.id})`);
    return { success: true, companyId: company.id, resendId: data?.id };

  } catch (error: any) {
    console.error(`[Error] ${company.email}:`, error.message);
    
    // Log failed attempt
    await supabase.from("email_sends").insert({
      company_id: company.id,
      email: company.email,
      campaign_step: step,
      subject,
      status: "failed",
      error_message: error.message,
      created_at: new Date().toISOString(),
    });

    return { success: false, companyId: company.id, error: error.message };
  }
}

// Sleep helper
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Main campaign runner
async function runCampaign(step: SequenceStep = "initial") {
  console.log(`\n[Campaign] Starting ${step} sequence...`);
  
  // Check daily limit
  const today = new Date().toISOString().split("T")[0];
  const { count } = await supabase
    .from("email_sends")
    .select("*", { count: "exact", head: true })
    .gte("created_at", `${today}T00:00:00`)
    .lt("created_at", `${today}T23:59:59`);

  const sentToday = count || 0;
  const remaining = RATE_LIMIT.perDay - sentToday;

  if (remaining <= 0) {
    console.log("[Campaign] Daily limit reached. Try again tomorrow.");
    return;
  }

  console.log(`[Campaign] Daily sends: ${sentToday}/${RATE_LIMIT.perDay} (${remaining} remaining)`);

  // Get eligible companies
  const toSend = Math.min(remaining, RATE_LIMIT.batchSize);
  const companies = await getEligibleCompanies(step, toSend);

  if (companies.length === 0) {
    console.log(`[Campaign] No eligible companies for ${step}`);
    return;
  }

  console.log(`[Campaign] Processing ${companies.length} companies...`);

  const results: SendResult[] = [];
  
  for (const company of companies) {
    const result = await sendEmail(company, step);
    results.push(result);

    // Rate limit delay
    if (companies.indexOf(company) < companies.length - 1) {
      console.log(`[Rate Limit] Waiting ${RATE_LIMIT.delayMs / 1000}s...`);
      await sleep(RATE_LIMIT.delayMs);
    }
  }

  // Summary
  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`\n[Campaign] Complete: ${successful} sent, ${failed} failed`);
}

// CLI interface
const step = (process.argv[2] as SequenceStep) || "initial";
if (!["initial", "followup1", "followup2"].includes(step)) {
  console.error("Usage: tsx send-campaign.ts [initial|followup1|followup2]");
  process.exit(1);
}

runCampaign(step).catch(console.error);
