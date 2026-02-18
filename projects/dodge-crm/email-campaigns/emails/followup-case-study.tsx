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

interface FollowupCaseStudyProps {
  companyName: string;
  contactName: string;
}

export const FollowupCaseStudy = ({
  companyName = "ABC Construction",
  contactName = "John",
}: FollowupCaseStudyProps) => {
  const previewText = `How Martinez Construction landed $2.4M in new contracts`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={eyebrow}>CASE STUDY</Text>
          
          <Heading style={heading}>
            How One Contractor Won $2.4M in Bids Using Early Project Intel
          </Heading>
          
          <Text style={paragraph}>Hi {contactName},</Text>
          
          <Text style={paragraph}>
            Following up on my last email about commercial projects near {companyName}.
          </Text>

          <Text style={paragraph}>
            Wanted to share what happened with Martinez Construction out of Phoenix:
          </Text>

          <Section style={quoteSection}>
            <Text style={quoteText}>
              "We were always hearing about projects too late — the specs were already 
              written around someone else. With Dodge's early intel, we got in front of 
              3 healthcare projects before they even posted. Closed $2.4M in the first 
              6 months."
            </Text>
            <Text style={quoteAuthor}>— Carlos Martinez, President</Text>
          </Section>

          <Text style={paragraph}>
            <strong>The difference:</strong> They found projects 45-60 days earlier than 
            public bid sites. Enough time to:
          </Text>

          <Section style={bulletSection}>
            <Text style={bulletPoint}>✓ Build relationships with decision-makers</Text>
            <Text style={bulletPoint}>✓ Influence specifications (legally)</Text>
            <Text style={bulletPoint}>✓ Prepare competitive, detailed proposals</Text>
            <Text style={bulletPoint}>✓ Line up subcontractors and materials</Text>
          </Section>

          <Text style={paragraph}>
            Martinez went from a 12% win rate to 34% — nearly 3x — just by getting 
            earlier access.
          </Text>

          <Text style={paragraph}>
            Would a quick 15-minute call make sense to see what's available in your 
            market? I can pull a custom list of projects matching {companyName}'s 
            capabilities.
          </Text>

          <Text style={paragraph}>
            Just reply to this email with a good time.
          </Text>

          <Text style={paragraph}>
            — The Dodge Network Team
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            <Link href="{{unsubscribe_url}}" style={link}>Unsubscribe</Link> from future emails
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default FollowupCaseStudy;

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

const eyebrow = {
  color: "#2563eb",
  fontSize: "12px",
  fontWeight: "600",
  letterSpacing: "0.5px",
  textTransform: "uppercase" as const,
  margin: "0 0 8px",
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

const quoteSection = {
  backgroundColor: "#f8fafc",
  borderLeft: "4px solid #2563eb",
  padding: "16px 20px",
  margin: "24px 0",
  borderRadius: "0 8px 8px 0",
};

const quoteText = {
  color: "#1a1a1a",
  fontSize: "15px",
  fontStyle: "italic",
  lineHeight: "1.6",
  margin: "0 0 8px",
};

const quoteAuthor = {
  color: "#64748b",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0",
};

const bulletSection = {
  margin: "0 0 16px",
  paddingLeft: "8px",
};

const bulletPoint = {
  color: "#525f7f",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "6px 0",
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
