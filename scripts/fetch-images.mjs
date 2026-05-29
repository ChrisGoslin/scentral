import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lrkdwobnemczvhpixpky.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // needs service role key, not anon key

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Fragrantica search URL template
function buildSearchUrl(brand, name) {
  const query = encodeURIComponent(`${brand} ${name}`);
  return `https://www.fragrantica.com/search/?query=${query}`;
}

// Known name overrides where our DB name differs from Fragrantica
const FRAGRANTICA_OVERRIDES = {
  'CDN Urban Man Elixir': 'Club de Nuit Urban Man Elixir',
  '9PM Rebel / Elixir': '9PM Rebel',
  'Khamrah / Qahwa': 'Khamrah',
  'Hawas Ice/Tropical': 'Hawas Ice',
  'CK One/Free': 'CK One',
  'Ameer Al Oudh Int.': 'Ameer Al Oudh Intense',
  'Musamam Black Int.': 'Musamam Black Intense',
  'Najdia Intense': 'Najdia',
  'S. Not Only Intense': 'Supremacy Not Only Intense',
};

async function searchFragrantica(brand, name) {
  const searchName = FRAGRANTICA_OVERRIDES[name] || name;
  const url = buildSearchUrl(brand, searchName);
  
  console.log(`  Searching: ${brand} - ${searchName}`);
  
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
    });
    
    if (!res.ok) {
      console.log(`  ✗ Search failed (${res.status})`);
      return null;
    }
    
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Find first search result link
    const firstResult = $('a[href*="/perfume/"]').first();
    const href = firstResult.attr('href');
    
    if (!href) {
      console.log(`  ✗ No results found`);
      return null;
    }
    
    const fragranceUrl = href.startsWith('http') ? href : `https://www.fragrantica.com${href}`;
    console.log(`  Found page: ${fragranceUrl}`);
    return fragranceUrl;
  } catch (err) {
    console.log(`  ✗ Search error: ${err.message}`);
    return null;
  }
}

async function extractImageUrl(fragrancePageUrl) {
  try {
    const res = await fetch(fragrancePageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
    });
    
    if (!res.ok) return null;
    
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Fragrantica bottle image is in the main perfume image div
    const img = $('div.fragrance-image img, img[itemprop="image"], .cell.text-center img').first();
    const src = img.attr('src');
    
    if (!src) return null;
    const imageUrl = src.startsWith('http') ? src : `https://www.fragrantica.com${src}`;
    console.log(`  Image: ${imageUrl}`);
    return imageUrl;
  } catch (err) {
    console.log(`  ✗ Image extract error: ${err.message}`);
    return null;
  }
}

async function downloadAndUpload(imageUrl, filename) {
  try {
    const res = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': 'https://www.fragrantica.com',
      },
    });
    
    if (!res.ok) {
      console.log(`  ✗ Download failed (${res.status})`);
      return null;
    }
    
    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    
    const { error } = await supabase.storage
      .from('fragrance-images')
      .upload(filename, buffer, {
        contentType,
        upsert: true,
      });
    
    if (error) {
      console.log(`  ✗ Upload error: ${error.message}`);
      return null;
    }
    
    const { data } = supabase.storage
      .from('fragrance-images')
      .getPublicUrl(filename);
    
    return data.publicUrl;
  } catch (err) {
    console.log(`  ✗ Upload error: ${err.message}`);
    return null;
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  if (!SUPABASE_SERVICE_KEY) {
    console.error('ERROR: Set SUPABASE_SERVICE_KEY env var before running');
    console.error('Get it from: Supabase dashboard → Settings → API → service_role key');
    process.exit(1);
  }

  // Fetch all fragrances with null image_url
  const { data: fragrances, error } = await supabase
    .from('fragrances')
    .select('id, brand, name, image_url')
    .is('image_url', null)
    .order('brand');

  if (error) {
    console.error('Failed to fetch fragrances:', error);
    process.exit(1);
  }

  console.log(`Found ${fragrances.length} fragrances with no image\n`);
  
  const results = { success: 0, failed: 0, skipped: 0 };

  for (const fragrance of fragrances) {
    console.log(`\n[${fragrance.brand}] ${fragrance.name}`);
    
    // 1. Search Fragrantica
    const pageUrl = await searchFragrantica(fragrance.brand, fragrance.name);
    if (!pageUrl) {
      results.failed++;
      continue;
    }
    
    // Be polite — wait between requests
    await sleep(1500);
    
    // 2. Extract image URL from page
    const imageUrl = await extractImageUrl(pageUrl);
    if (!imageUrl) {
      results.failed++;
      continue;
    }
    
    await sleep(1000);
    
    // 3. Download + upload to Supabase Storage
    const filename = `${fragrance.id}.jpg`;
    const publicUrl = await downloadAndUpload(imageUrl, filename);
    if (!publicUrl) {
      results.failed++;
      continue;
    }
    
    // 4. Update image_url in DB
    const { error: updateError } = await supabase
      .from('fragrances')
      .update({ image_url: publicUrl })
      .eq('id', fragrance.id);
    
    if (updateError) {
      console.log(`  ✗ DB update failed: ${updateError.message}`);
      results.failed++;
    } else {
      console.log(`  ✓ Done: ${publicUrl}`);
      results.success++;
    }
    
    // Polite delay between fragrances
    await sleep(2000);
  }

  console.log('\n=== RESULTS ===');
  console.log(`✓ Success: ${results.success}`);
  console.log(`✗ Failed:  ${results.failed}`);
  console.log(`- Skipped: ${results.skipped}`);
  console.log('\nRun the script again to retry any failed ones.');
}

main();
