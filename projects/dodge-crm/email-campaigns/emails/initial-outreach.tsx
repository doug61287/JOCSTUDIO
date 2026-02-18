import {
  Body,
  Button,
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

interface InitialOutreachProps {
  companyName: string;
  contactName: string;
  projectCount?: number;
  region?: string;
}

export const InitialOutreach = ({
  companyName = "ABC Construction",
  contactName = "John",
  projectCount = 47,
  region = "your area",
}: InitialOutreachProps) => {
  const previewText = `${companyName} - ${projectCount} new commercial projects in ${region}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>
            {projectCount} Commercial Projects Near You
          </Heading>
          
          <Text style={paragraph}>Hi {contactName},</Text>
          
          <Text style={paragraph}>
            I noticed <strong>{companyName}</strong> specializes in commercial construction 
            in {region}. Thought you'd want to know — there are currently <strong>{projectCount} 
            active commercial projects</strong> in your service area that are seeking bids.
          </Text>

          <Text style={paragraph}>
            We've aggregated project data from Dodge Construction Network covering:
          </Text>

          <Section style={bulletSection}>
            <Text style={bulletPoint}>• Office buildings & retail spaces</Text>
            <Text style={bulletPoint}>• Healthcare & education facilities</Text>
            <Text style={bulletPoint}>• Industrial & warehouse projects</Text>
            <Text style={bulletPoint}>• Government & municipal contracts</Text>
          </Section>

          <Text style={paragraph}>
            Each listing includes project specs, timeline, budget range, and decision-maker 
            contacts — everything you need to submit a competitive bid.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href="https://dodgenetwork.com/demo?ref=outreach">
              View Projects in Your Area
            </Button>
          </Section>

          <Text style={paragraph}>
            Want me to send over a sample of projects matching {companyName}'s specialties?
          </Text>

          <Text style={paragraph}>
            Best,<br />
            The Dodge Network Team
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            You're receiving this because {companyName} is listed in commercial construction 
            directories. <Link href="{{unsubscribe_url}}" style={link}>Unsubscribe</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default InitialOutreach;

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
  fontSize: "24px",
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

const bulletSection = {
  margin: "0 0 16px",
  paddingLeft: "8px",
};

const bulletPoint = {
  color: "#525f7f",
  fontSize: "15px",
  lineHeight: "1.4",
  margin: "4px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "12px 24px",
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
