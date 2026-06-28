/**
 * Upload exercise thumbnails to Supabase Storage
 * 
 * Usage:
 *   1. Install dependency: npm install @supabase/supabase-js
 *   2. Run: node scripts/upload-thumbnails.js
 * 
 * This uploads all images from the Thumbnails folder to the "Thumbnails" bucket
 * and outputs the public URLs for each file.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = 'https://ubgmeqijydyzehxzkibj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_GZlgEqbZKKHFOAlFexfHYA_PWHYJH9G';
const BUCKET_NAME = 'Thumbnails';

// Path to thumbnails folder
const THUMBNAILS_DIR = path.join(__dirname, '..', 'Thumbnails');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function uploadThumbnails() {
  console.log('Reading thumbnails from:', THUMBNAILS_DIR);
  
  const files = fs.readdirSync(THUMBNAILS_DIR)
    .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));
  
  console.log(`Found ${files.length} images to upload\n`);

  const results = [];

  for (const file of files) {
    const filePath = path.join(THUMBNAILS_DIR, file);
    const fileBuffer = fs.readFileSync(filePath);
    const fileExt = path.extname(file).toLowerCase();
    const contentType = fileExt === '.png' ? 'image/png' : 'image/jpeg';

    console.log(`Uploading: ${file}`);

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(file, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error(`  ✗ Failed: ${error.message}`);
      results.push({ file, success: false, error: error.message });
    } else {
      const publicUrl = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(file).data.publicUrl;
      
      console.log(`  ✓ Success: ${publicUrl}`);
      results.push({ file, success: true, url: publicUrl });
    }
  }

  console.log('\n========================================');
  console.log('UPLOAD SUMMARY');
  console.log('========================================');
  
  const succeeded = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`\n✓ ${succeeded.length} uploaded successfully`);
  if (failed.length > 0) {
    console.log(`✗ ${failed.length} failed`);
    failed.forEach(r => console.log(`  - ${r.file}: ${r.error}`));
  }

  console.log('\n========================================');
  console.log('PUBLIC URLs (for database updates)');
  console.log('========================================\n');
  
  succeeded.forEach(r => {
    console.log(`${r.file}: ${r.url}`);
  });

  // Output SQL update statements
  console.log('\n========================================');
  console.log('SQL UPDATE STATEMENTS');
  console.log('========================================\n');
  
  const nameMap = {
    'bench press.png': 'Barbell Bench Press',
    'Cable pushdown.png': 'Cable Pushdowns',
    'Incline dumbbell press.png': 'Low Incline Dumbbell Press',
    'Lateral raise.png': 'Lateral Raises',
    'Seated mid chest cable fly.png': 'Seated Mid-Chest Cable Fly',
    'Single Arm Overhead Extension.png': 'Single Arm Overhead Extension',
  };

  succeeded.forEach(r => {
    const exerciseName = nameMap[r.file];
    if (exerciseName) {
      console.log(`update exercises set thumbnail_url = '${r.url}' where name = '${exerciseName}';`);
    }
  });
}

uploadThumbnails().catch(console.error);
