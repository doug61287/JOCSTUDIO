import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface FollowupBreakupProps {
  companyName: string;
  contactName: string;
  projectCount?: number;
}

export const FollowupBreakup = ({
  companyName = "ABC Construction",
  contactName = "John",
  projectCount = 23,
}: FollowupBreakupProps) => {
  const previewText = `Closing the loop on ${companyName} project leads`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>
            Closing the Loop
          </Heading>
          
          <Text style={paragraph}>Hi {contactName},</Text>
          
          <Text style={paragraph}>
            I've reached out a couple times about commercial project leads for 
            {" "}{companyName}, but haven't heard back.
          </Text>

          <Text style={paragraph}>
            Totally get it — busy season, wrong timing, or maybe this just isn't 
            a priority right now.
          </Text>

          <Text style={paragraph}>
            I'll close out this thread, but wanted to leave you with this:
          </Text>

          <Section style={statBox}>
            <Text style={statNumber}>{projectCount}</Text>
            <Text style={statLabel}>
              commercial projects are currently seeking bids in your service area
            </Text>
          </Section>

          <Text style={paragraph}>
            If things change and you want to see what's available, here's my 
            calendar link — no pitch, just a quick look at what matches your 
            capabilities:
          </Text>

          <Text style={paragraph}>
            <Link href="https://calendly.com/dodge-demo" style={calLink}>
              → Book 15 minutes
            </Link>
          </Text>

          <Text style={paragraph}>
            Either way, wishing {companyName} a strong year ahead.
          </Text>

          <Text style={paragraph}>
            Best,<br />
            The Dodge Network Team
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            This is the last email in this sequence. You won't hear from us again 
            unless you reach out.{" "}
            <Link href="{{unsubscribe_url}}" style={link}>Unsubscribe anyway</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default FollowupBreakup;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
  borderRadius: "8px",
};

const heading = {
  color: "#1a1a1a",
  fontSize: "22px",
  fontWeight: "600",
  lineHeight: "1.3",
  margin: "0 0 24px",
};

const paragraph = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 16px",
};

const statBox = {
  backgroundColor: "#1e40af",
  borderRadius: "8px",
  padding: "24px",
  textAlign: "center" as const,
  margin: "24px 0",
};

const statNumber = {
  color: "#ffffff",
  fontSize: "48px",
  fontWeight: "700",
  margin: "0 0 4px",
  lineHeight: "1",
};

const statLabel = {
  color: "#bfdbfe",
  fontSize: "14px",
  margin: "0",
  lineHeight: "1.4",
};

const calLink = {
  color: "#2563eb",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "32px 0 16px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "1.5",
};

const link = {
  color: "#2563eb",
  textDecoration: "underline",
};
