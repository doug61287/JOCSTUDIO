#!/usr/bin/env node
/**
 * POD Design Generator — Module 2
 * Generates product designs via Ideogram API from trend prompts.
 * Falls back to DALL-E 3 if Ideogram key not set.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_FILE = path.join(__dirname, '..', 'assets', 'state.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'generated', 'designs');

function loadState() {
  if (fs.existsSync(STATE_FILE)) return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  return {};
}

function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

/** Generate image via Ideogram API */
async function generateIdeogram(prompt, outputPath) {
  const apiKey = process.env.IDEOGRAM_API_KEY;
  if (!apiKey) throw new Error('IDEOGRAM_API_KEY not set');

  const body = JSON.stringify({
    image_request: {
      prompt: `${prompt}, transparent background, high contrast, print-ready, vector style`,
      model: 'V_2',
      magic_prompt_option: 'AUTO',
      style_type: 'DESIGN',
      aspect_ratio: 'ASPECT_1_1',
    }
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.ideogram.ai',
      path: '/generate',
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const parsed = JSON.parse(data);
        const imageUrl = parsed?.data?.[0]?.url;
        if (!imageUrl) return reject(new Error('No image URL in Ideogram response'));
        resolve(imageUrl);
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/** Generate image via DALL-E 3 (fallback) */
async function generateDallE(prompt, outputPath) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const body = JSON.stringify({
    model: 'dall-e-3',
    prompt: `${prompt}, transparent background, print-on-demand t-shirt design, clean vector style`,
    n: 1,
    size: '1024x1024',
    quality: 'hd',
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const parsed = JSON.parse(data);
        const imageUrl = parsed?.data?.[0]?.url;
        if (!imageUrl) return reject(new Error('No image URL in DALL-E response'));
        resolve(imageUrl);
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/** Download image to disk */
async function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    https.get(url, (res) => {
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {}); // cleanup
      reject(err);
    });
  });
}

async function main() {
  const state = loadState();
  const prompts = state.designPrompts || [];
  const niche = state.niche || 'cat-mom';

  if (prompts.length === 0) {
    console.log('⚠️  No design prompts found. Run trend-scout.py first.');
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`\n🎨 POD Design Generator — Niche: ${niche}`);
  console.log('='.repeat(50));
  console.log(`Generating ${Math.min(5, prompts.length)} designs...\n`);

  const generated = [];
  const provider = process.env.IDEOGRAM_API_KEY ? 'Ideogram' : 'DALL-E 3';
  console.log(`Provider: ${provider}`);

  for (const [i, prompt] of prompts.slice(0, 5).entries()) {
    const designId = `design-${niche}-${Date.now()}-${i}`;
    const outputPath = path.join(OUTPUT_DIR, `${designId}.png`);

    console.log(`\n[${i + 1}/5] Generating: "${prompt.slice(0, 60)}..."`);

    try {
      const imageUrl = process.env.IDEOGRAM_API_KEY
        ? await generateIdeogram(prompt, outputPath)
        : await generateDallE(prompt, outputPath);

      await downloadImage(imageUrl, outputPath);

      const design = {
        id: designId,
        prompt,
        niche,
        imagePath: outputPath,
        imageUrl,
        generatedAt: new Date().toISOString(),
        provider,
        status: 'ready',
      };

      generated.push(design);
      console.log(`  ✅ Saved: ${path.basename(outputPath)}`);
    } catch (err) {
      console.log(`  ❌ Failed: ${err.message}`);
    }
  }

  // Update state
  state.generatedDesigns = [...(state.generatedDesigns || []), ...generated];
  saveState(state);

  console.log(`\n✅ Generated ${generated.length} designs`);
  console.log(`📁 Saved to: ${OUTPUT_DIR}`);
  console.log(`\n💡 Next: run mockup-engine.js to create product mockups`);
}

main().catch(console.error);
