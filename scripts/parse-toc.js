#!/usr/bin/env node
/**
 * Parse NYC H+H CTC Table of Contents to build hierarchy mapping
 * Creates a JSON structure mapping codes to names at each level
 */

const fs = require('fs');
const path = require('path');

const tocPath = path.join(__dirname, '../product/data/nyc-hh-ctc-2024-toc.txt');
const outputPath = path.join(__dirname, '../product/data/toc-hierarchy.json');
const tsOutputPath = path.join(__dirname, '../product/app/src/data/tocHierarchy.ts');

const text = fs.readFileSync(tocPath, 'utf-8');
const lines = text.split('\n');

// Result structure
const hierarchy = {
  divisions: {},      // "01" -> "General Requirements"
  sections: {},       // "01 10" -> "Summary"
  subsections: {},    // "01 11" -> "Summary Of Work"
  tree: {}            // Nested structure for navigation
};

// Patterns to match different levels
// Division: starts at column 0, format "XX Name" where XX is 2 digits
// Section: indented 2 spaces, format "XX XX Name"
// Subsection: indented ~5 spaces, format "XX XX XX Name" or "XX XX Name"

let currentDivision = null;
let currentSection = null;

for (const line of lines) {
  // Skip empty lines and footer/header lines
  if (!line.trim()) continue;
  if (line.includes('copyright') || line.includes('Page TOC') || line.includes('Table of Contents')) continue;
  if (line.includes('NYC Health + Hospitals')) continue;
  
  // Clean the line - remove dots and page numbers
  let cleanLine = line.replace(/\.{2,}\s*\d+$/, '').trim();
  if (!cleanLine) continue;
  
  // Count leading spaces to determine level
  const leadingSpaces = line.match(/^(\s*)/)[1].length;
  
  // Try to extract code and name
  // Division pattern: "XX Name" at start of line
  // Section pattern: "XX XX Name" with 2 spaces indent
  // Subsection pattern: "XX XX XX Name" or "XX XX Name" with more indent
  
  // Match patterns (flexible - names may have trailing content)
  const divisionMatch = cleanLine.match(/^(\d{2})\s+([A-Z][A-Za-z,\s\-\(\)&\/]+)/);
  const sectionMatch = cleanLine.match(/^(\d{2}\s+\d{2})\s+([A-Z][A-Za-z,\s\-\(\)&\/]+)/);
  const subsectionMatch = cleanLine.match(/^(\d{2}\s+\d{2}\s+\d{2})\s+([A-Z][A-Za-z,\s\-\(\)&\/]+)/);
  const subsection4Match = cleanLine.match(/^(\d{2}\s+\d{2})\s+([A-Z][A-Za-z,\s\-\(\)&\/]+)/);
  
  // Check if line is a division (starts with 2-digit code followed by letter, not another digit)
  const isDivisionLine = leadingSpaces === 0 && cleanLine.match(/^(\d{2})\s+[A-Z]/);
  
  if (isDivisionLine && divisionMatch) {
    // Division level
    const code = divisionMatch[1];
    const name = divisionMatch[2].trim();
    hierarchy.divisions[code] = name;
    currentDivision = code;
    hierarchy.tree[code] = { name, sections: {} };
    console.log(`Division: ${code} -> ${name}`);
  } else if (leadingSpaces >= 2 && leadingSpaces < 5 && sectionMatch) {
    // Section level (e.g., "01 10")
    const code = sectionMatch[1].replace(/\s+/g, ' ');
    const name = sectionMatch[2].trim();
    hierarchy.sections[code] = name;
    currentSection = code;
    if (currentDivision && hierarchy.tree[currentDivision]) {
      hierarchy.tree[currentDivision].sections[code] = { name, subsections: {} };
    }
    // console.log(`  Section: ${code} -> ${name}`);
  } else if (leadingSpaces >= 5) {
    // Subsection level
    if (subsectionMatch) {
      // 6-digit code (e.g., "03 01 30")
      const code = subsectionMatch[1].replace(/\s+/g, ' ');
      const name = subsectionMatch[2].trim();
      hierarchy.subsections[code] = name;
      if (currentDivision && currentSection && 
          hierarchy.tree[currentDivision]?.sections[currentSection]) {
        hierarchy.tree[currentDivision].sections[currentSection].subsections[code] = name;
      }
      // console.log(`    Subsection (6): ${code} -> ${name}`);
    } else if (subsection4Match) {
      // 4-digit code as subsection (e.g., "01 11" under "01 10")
      const code = subsection4Match[1].replace(/\s+/g, ' ');
      const name = subsection4Match[2].trim();
      // Only add if not already a section
      if (!hierarchy.sections[code]) {
        hierarchy.subsections[code] = name;
        if (currentDivision && currentSection && 
            hierarchy.tree[currentDivision]?.sections[currentSection]) {
          hierarchy.tree[currentDivision].sections[currentSection].subsections[code] = name;
        }
        // console.log(`    Subsection (4): ${code} -> ${name}`);
      }
    }
  }
}

// Statistics
console.log('\n📊 TOC Hierarchy Parsed:');
console.log(`   Divisions: ${Object.keys(hierarchy.divisions).length}`);
console.log(`   Sections: ${Object.keys(hierarchy.sections).length}`);
console.log(`   Subsections: ${Object.keys(hierarchy.subsections).length}`);

// Write JSON output
fs.writeFileSync(outputPath, JSON.stringify(hierarchy, null, 2));
console.log(`\n✅ Wrote JSON to: ${outputPath}`);

// Generate TypeScript file
const tsContent = `/**
 * NYC H+H CTC Table of Contents Hierarchy
 * Auto-generated from TOC PDF - DO NOT EDIT MANUALLY
 * 
 * Generated: ${new Date().toISOString()}
 */

export interface TOCSection {
  name: string;
  subsections: Record<string, string>;
}

export interface TOCDivision {
  name: string;
  sections: Record<string, TOCSection>;
}

export type TOCTree = Record<string, TOCDivision>;

/** Division code -> Division name */
export const DIVISIONS: Record<string, string> = ${JSON.stringify(hierarchy.divisions, null, 2)};

/** Section code (e.g., "01 10") -> Section name */
export const SECTIONS: Record<string, string> = ${JSON.stringify(hierarchy.sections, null, 2)};

/** Subsection code (e.g., "01 11" or "03 01 30") -> Subsection name */
export const SUBSECTIONS: Record<string, string> = ${JSON.stringify(hierarchy.subsections, null, 2)};

/** Full nested tree structure for navigation */
export const TOC_TREE: TOCTree = ${JSON.stringify(hierarchy.tree, null, 2)};

/** Get division name by code */
export function getDivisionName(code: string): string | undefined {
  return DIVISIONS[code.padStart(2, '0')];
}

/** Get section name by code */
export function getSectionName(code: string): string | undefined {
  return SECTIONS[code];
}

/** Get subsection name by code */
export function getSubsectionName(code: string): string | undefined {
  return SUBSECTIONS[code];
}

/** Get all sections for a division */
export function getSectionsForDivision(divCode: string): Record<string, TOCSection> {
  const div = TOC_TREE[divCode.padStart(2, '0')];
  return div?.sections || {};
}

/** Get all subsections for a section */
export function getSubsectionsForSection(divCode: string, sectionCode: string): Record<string, string> {
  const div = TOC_TREE[divCode.padStart(2, '0')];
  const section = div?.sections[sectionCode];
  return section?.subsections || {};
}

/** Parse a task code and return hierarchy info */
export function parseTaskCode(taskCode: string): {
  division: string;
  divisionName?: string;
  section?: string;
  sectionName?: string;
  subsection?: string;
  subsectionName?: string;
} {
  // Task code format: DDSSSSNN-IIII or variations
  const clean = taskCode.replace(/[^0-9]/g, '');
  const division = clean.substring(0, 2);
  const section = clean.length >= 4 ? \`\${division} \${clean.substring(2, 4)}\` : undefined;
  const subsection = clean.length >= 6 ? \`\${division} \${clean.substring(2, 4)} \${clean.substring(4, 6)}\` : undefined;
  
  return {
    division,
    divisionName: DIVISIONS[division],
    section,
    sectionName: section ? SECTIONS[section] : undefined,
    subsection,
    subsectionName: subsection ? SUBSECTIONS[subsection] : undefined
  };
}
`;

fs.writeFileSync(tsOutputPath, tsContent);
console.log(`✅ Wrote TypeScript to: ${tsOutputPath}`);

// Show sample of parsed data
console.log('\n📋 Sample Divisions:');
Object.entries(hierarchy.divisions).slice(0, 5).forEach(([k, v]) => console.log(`   ${k}: ${v}`));

console.log('\n📋 Sample Sections:');
Object.entries(hierarchy.sections).slice(0, 5).forEach(([k, v]) => console.log(`   ${k}: ${v}`));

console.log('\n📋 Sample Subsections:');
Object.entries(hierarchy.subsections).slice(0, 5).forEach(([k, v]) => console.log(`   ${k}: ${v}`));
