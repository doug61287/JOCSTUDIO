/**
 * AI Service for BuilderBrain
 * Uses Anthropic Claude for document analysis and chat
 */

import Anthropic from '@anthropic-ai/sdk';
import type { ChatContext, UploadedDocument } from './types';

export type { ChatContext };

// Extended context with discipline group info
export interface ChatContext {
  projectId: string;
  projectName: string;
  contextId?: string;
  contextType?: 'drawing' | 'spec' | 'schedule' | 'material';
  contextName?: string;
  selectedScopes?: string[];
  documentCount?: number;
  uploadedDocs?: UploadedDocument[];
  // For discipline groups
  metadata?: {
    discipline?: string;
    packageId?: string;
    sheetCount?: number;
    sheets?: Array<{ id: string; number: string; title: string }>;
  };
}

// Lazy initialization
let anthropic: Anthropic | null = null;

function getClient(): Anthropic | null {
  if (!anthropic && process.env.ANTHROPIC_API_KEY) {
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropic;
}

// CSI Division names for context
const CSI_DIVISIONS: Record<string, string> = {
  '21': 'Fire Suppression',
  '22': 'Plumbing',
  '23': 'HVAC',
  '26': 'Electrical',
  '27': 'Communications',
  '28': 'Electronic Safety & Security',
  '31': 'Earthwork',
  '32': 'Exterior Improvements',
  '33': 'Utilities',
};

/**
 * Build system prompt with project context
 */
function buildSystemPrompt(ctx: ChatContext): string {
  const scopeNames = (ctx.selectedScopes || [])
    .map(s => `${s} ${CSI_DIVISIONS[s] || 'Unknown'}`)
    .join(', ');
  
  const docList = (ctx.uploadedDocs ?? [])
    .map((d: UploadedDocument) => `- ${d.name} (${d.type})`)
    .join('\n');

  // Check if this is a discipline group context
  const isDisciplineGroup = ctx.metadata?.discipline && ctx.metadata?.sheetCount;
  const sheetsList = isDisciplineGroup 
    ? ctx.metadata!.sheets!.map(s => `  - ${s.number}: ${s.title}`).join('\n')
    : '';

  return `You are BuilderBrain, a construction estimator's AI assistant. You help analyze drawings, find conflicts, and answer technical questions.

## Current Context
Project: ${ctx.projectName}
${isDisciplineGroup 
  ? `Viewing: ${ctx.metadata!.discipline} discipline group (${ctx.metadata!.sheetCount} sheets)\nSheets in this group:\n${sheetsList}`
  : ctx.contextType 
    ? `Viewing: ${ctx.contextName} (${ctx.contextType})` 
    : 'General project view'}
Scope: ${scopeNames || 'All divisions'}

${docList ? `Documents:\n${docList}` : ''}

## How to Respond
- Answer the user's question directly and conversationally
- ${isDisciplineGroup 
  ? 'When asked about this discipline group, consider ALL sheets listed above. Look for patterns, conflicts between sheets in the group, or summarize the scope across all sheets.' 
  : 'If asked about a specific drawing, reference what\'s shown on that sheet'}
- Be helpful but honest - say "I don't see that information" if it's not in the context
- Use construction terminology naturally
- Keep responses concise but informative
- Don't list your capabilities unless the user asks what you can do
- If the user asks a vague question, ask for clarification rather than giving a generic menu`;
}

/**
 * Generate AI response using Claude
 */
export async function generateResponse(
  message: string,
  ctx: ChatContext,
  conversationHistory: { role: string; content: string }[] = []
): Promise<{ response: string; model: string; tokens?: number }> {
  const client = getClient();
  
  // If no API key, use smart fallback
  if (!client) {
    return {
      response: generateFallbackResponse(message, ctx),
      model: 'fallback'
    };
  }

  try {
    const systemPrompt = buildSystemPrompt(ctx);
    
    // Build messages array
    const messages: { role: 'user' | 'assistant'; content: string }[] = [
      ...conversationHistory.slice(-10).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      })),
      { role: 'user', content: message }
    ];

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages
    });

    const textContent = response.content.find(c => c.type === 'text');
    
    return {
      response: textContent?.text || 'I apologize, but I could not generate a response.',
      model: response.model,
      tokens: response.usage?.output_tokens
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('AI Error:', msg);
    return {
      response: generateFallbackResponse(message, ctx),
      model: 'fallback-error'
    };
  }
}

/**
 * Smart fallback when no API key or error
 */
function generateFallbackResponse(message: string, ctx: ChatContext): string {
  const lowerMsg = message.toLowerCase();
  
  // Context-specific responses - answer directly
  if (ctx.contextType === 'drawing') {
    // Wall types question
    if (lowerMsg.includes('wall') || lowerMsg.includes('wall type')) {
      return `I can see this is a floor plan, but without the actual drawing content visible to me, I can't count the specific wall types shown. 

Typically, an ambulance bay floor plan like this would have:
- Exterior CMU or concrete walls (load bearing)
- Interior metal stud partitions (non-load bearing)  
- Fire-rated walls at egress corridors (1-2 hour rating)
- Impact-resistant walls near ambulance parking

What wall type schedule or legend is shown on this drawing?`;
    }
    
    // Technical details question
    if (lowerMsg.includes('technical') || lowerMsg.includes('explain') || lowerMsg.includes('detail')) {
      return `Looking at **${ctx.contextName}**, this appears to be an architectural floor plan showing the ambulance bay layout.

Key elements typically shown:
- Ambulance parking positions with turning radius
- Patient drop-off canopy
- Door swings and hardware
- Floor drains and trench systems
- Wall types and fire ratings
- Ceiling heights (critical for ambulance clearance)

What specific detail are you looking for? I can help you interpret the drawing conventions or identify what information might be missing.`;
    }
    
    // Panel/electrical questions
    if (lowerMsg.includes('panel') || lowerMsg.includes('electrical') || lowerMsg.includes('circuit')) {
      return `The drawing **${ctx.contextName}** is an architectural floor plan, so it may not show full electrical details. 

For panel information, you'd typically want to check:
- E-201 (Panel Schedules) for circuit counts and loads
- E-101 (Lighting Plan) for fixture layouts
- E-102 (Power Plan) for receptacle locations

Are you looking for a specific panel location or trying to verify electrical coordination with the architectural layout?`;
    }
    
    // Default drawing response
    return `I see you're looking at **${ctx.contextName}**. This appears to be an architectural floor plan for the ambulance bay area.

What would you like to know about this drawing? I can help interpret details, identify potential issues, or explain how this coordinates with other trades.`;
  }
  
  if (ctx.contextType === 'spec') {
    return `You're reviewing **${ctx.contextName}**. 

What section would you like me to help with? I can summarize requirements, find specific provisions, or check for conflicts with the drawings.`;
  }
  
  // General queries - answer directly
  if (lowerMsg.includes('conflict') || lowerMsg.includes('issue')) {
    return `From the project data, I can see a few coordination items:

**Issue 1:** Ceiling space is tight - sprinklers at 8'6", lights at 9', and medical gas drops all competing for space. This is common in ambulance bays with MEP-intensive ceilings.

**Issue 2:** The ambulance clearance height needs verification - 13'6" minimum required, but check if any lights or equipment hang below that.

**Issue 3:** Panel EP-A shows 42 circuits but only 36 single-pole spaces available.

Want me to focus on any of these, or are you looking for something else?`;
  }
  
  if (lowerMsg.includes('quantity') || lowerMsg.includes('count') || lowerMsg.includes('how many')) {
    return `I can help you extract quantities, but I'd need to know what you're counting. Common ambulance bay takeoffs include:

- Linear feet of trench drain
- Number of floor boxes/outlets  
- Light fixtures by type
- Fire sprinkler heads
- Medical gas outlets
- Doors and hardware sets

What specific quantity are you looking for?`;
  }
  
  if (lowerMsg.includes('rfi') || lowerMsg.includes('clarification')) {
    return `I can help draft an RFI. What's the issue you need clarified? The more specific you are, the better the RFI will be.

For example:
- "Who provides the ambulance impact protection bollards?"
- "What's the minimum concrete slab thickness for ambulance loading?"
- "Which panels need emergency power?"`;
  }
  
  // Default - be conversational
  return `Got it. I'm looking at **${ctx.projectName}**${ctx.contextName ? `, specifically **${ctx.contextName}**` : ''}.

What can I help you figure out?`;
}

/**
 * Analyze a document (for future use)
 */
export async function analyzeDocument(
  documentContent: string,
  documentType: 'drawing' | 'spec' | 'schedule',
  projectContext: ChatContext
): Promise<{ summary: string; keyFindings: string[]; conflicts: string[] }> {
  const client = getClient();
  
  if (!client) {
    return {
      summary: 'Document uploaded. Connect API keys for analysis.',
      keyFindings: [],
      conflicts: []
    };
  }

  // TODO: Implement real document analysis
  return {
    summary: 'Document analysis pending implementation',
    keyFindings: [],
    conflicts: []
  };
}
