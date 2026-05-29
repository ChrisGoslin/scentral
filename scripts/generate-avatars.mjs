import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'node:fs';
import * as path from 'node:path';

// 1. Initialize Clients
const SUPABASE_URL = 'https://lrkdwobnemczvhpixpky.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('ERROR: Set SUPABASE_SERVICE_KEY env var before running');
  process.exit(1);
}

if (!GEMINI_API_KEY) {
  console.error('ERROR: Set GEMINI_API_KEY env var before running (for Nano Banana image generation)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const aiConsumer = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// 2. Setup local temp directory
const TMP_DIR = path.join(process.cwd(), 'tmp-avatars');
if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

async function generateOlfactoryAvatar(fragrance, retries = 3, delay = 10000) {
  const prompt = `Highly imaginative and evocative photography inspired by the luxury fragrance '${fragrance.name}' by ${fragrance.brand}. 
  The primary olfactive family is ${fragrance.primary_vector}. 
  The scent notes are: ${fragrance.notes}.
  Create a breathtaking, cinematic scene that depicts exactly what a person would imagine when they smell this (e.g., a sunset beach, fresh linen sheets, a smoky speakeasy). 
  Use the style of 'Milan scents'—surreal, evocative, and hyper-realistic AI imagery that captures the essence and mood of the scent profile. No literal perfume bottles, no text.`;

  console.log(`  🎨 Prompting Nano Banana Engine...`);
  
  try {
    const response = await aiConsumer.models.generateContent({
      model: 'gemini-3.1-flash-image',
      contents: prompt,
      config: {
        aspectRatio: '1:1', // Square is better for cards/thumbnails
        outputMimeType: 'image/png',
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const buffer = Buffer.from(part.inlineData.data, 'base64');
          const localPath = path.join(TMP_DIR, `${fragrance.id}.png`);
          fs.writeFileSync(localPath, buffer);
          console.log(`  ✓ Generated local asset: ${localPath}`);
          return { buffer, contentType: 'image/png', filename: `${fragrance.id}.png` };
        }
      }
    }
    throw new Error('No image payload returned from model.');
  } catch (err) {
    if (err.message.includes('429') || err.message.includes('Quota exceeded') || err.status === 'RESOURCE_EXHAUSTED') {
      if (retries > 0) {
        console.warn(`  ⚠ Rate limit hit. Backing off for ${delay / 1000}s... (${retries} retries left)`);
        await sleep(delay);
        return generateOlfactoryAvatar(fragrance, retries - 1, delay * 2);
      }
    }
    console.error(`  ✗ Generation failed: ${err.message}`);
    return null;
  }
}

async function uploadToSupabase(assetData) {
  console.log(`  ☁️ Uploading to Sovereign Archives...`);
  try {
    const { error } = await supabase.storage
      .from('fragrance-images')
      .upload(assetData.filename, assetData.buffer, {
        contentType: assetData.contentType,
        upsert: true,
      });

    if (error) {
      console.error(`  ✗ Upload failed: ${error.message}`);
      return null;
    }

    const { data } = supabase.storage
      .from('fragrance-images')
      .getPublicUrl(assetData.filename);

    return data.publicUrl;
  } catch (err) {
    console.error(`  ✗ Upload error: ${err.message}`);
    return null;
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🚀 Initiating Olfactory Avatar Generation Pipeline...\n');

  // Fetch all fragrances that still need an avatar
  const { data: fragrances, error } = await supabase
    .from('fragrances')
    .select('id, brand, name, primary_vector, notes, image_url')
    .is('image_url', null)
    .order('brand');

  if (error) {
    console.error('Failed to fetch fragrances from Sovereign DB:', error);
    process.exit(1);
  }

  console.log(`Targeting ${fragrances.length} unthemed essences\n`);
  
  let success = 0;
  let failed = 0;

  for (const fragrance of fragrances) {
    console.log(`\n[${fragrance.brand}] ${fragrance.name} (${fragrance.primary_vector})`);
    
    // 1. Generate Asset
    const assetData = await generateOlfactoryAvatar(fragrance);
    if (!assetData) {
      failed++;
      continue;
    }
    
    // 2. Upload Asset
    const publicUrl = await uploadToSupabase(assetData);
    if (!publicUrl) {
      failed++;
      continue;
    }
    
    // 3. Update DB
    const { error: updateError } = await supabase
      .from('fragrances')
      .update({ image_url: publicUrl })
      .eq('id', fragrance.id);
    
    if (updateError) {
      console.error(`  ✗ Database sync failed: ${updateError.message}`);
      failed++;
    } else {
      console.log(`  ✓ Enshrined Avatar: ${publicUrl}`);
      success++;
    }
    
    // Rate limit buffering - 6000ms guarantees max 10 requests per minute
    await sleep(6000);
  }

  console.log('\n=== PIPELINE TERMINATED ===');
  console.log(`✓ Masterpieces: ${success}`);
  console.log(`✗ Failures:  ${failed}`);
  
  // Cleanup tmp dir
  try {
    fs.rmSync(TMP_DIR, { recursive: true, force: true });
  } catch(e) {}
}

main();
