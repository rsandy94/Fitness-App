/**
 * Seed Supabase from CSV files in data/
 *
 * Workflow:
 *   1. Fill in Google Sheet (exercises, workout_templates, template_exercises)
 *   2. File > Download > Comma-separated values (.csv) — current sheet
 *   3. Save exported CSVs to data/ (overwrite the existing ones)
 *   4. Run: npm run seed
 *
 * Thumbnails: by default, fetched from the YouTube video in `youtube_link`.
 * Set `thumbnail_file` in exercises.csv to override with a custom local image.
 *
 * The script is idempotent — safe to run repeatedly. It matches rows by `name`
 * (for exercises + templates) and by (template_id, exercise_id) for links.
 *
 * CSV columns:
 *   exercises.csv          : slug, name, workout_type, muscles, youtube_link, instructions, thumbnail_file
 *   workout_templates.csv  : name, type, description
 *   template_exercises.csv : template_name, exercise_name, sets, reps_range, sort_order
 *   weekly_schedule.csv    : day_of_week, template_name, is_rest_day
 *                           (day_of_week: 0=Sun, 1=Mon, ..., 6=Sat. Leave template_name empty for rest days.)
 *
 * Notes:
 *   - muscles column uses ; as separator (e.g. "Chest;Front Delts;Triceps")
 *   - thumbnails are uploaded as {slug}.jpg — Storage URLs stay stable across runs
 *   - YouTube thumbnails tried in order: maxresdefault > sddefault > hqdefault
 *   - Renaming an exercise in the sheet requires deleting the old DB row first
 *     (because name is the upsert key)
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const SUPABASE_URL = 'https://ubgmeqijydyzehxzkibj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_GZlgEqbZKKHFOAlFexfHYA_PWHYJH9G';
const BUCKET = 'Thumbnails';
const DATA_DIR = path.join(ROOT, 'data');
const THUMBNAILS_DIR = path.join(ROOT, 'Thumbnails');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function readCSV(filename) {
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) {
    console.log(`  ⊘ ${filename} not found, skipping`);
    return [];
  }
  const raw = fs.readFileSync(filepath, 'utf8');
  const { data, errors } = Papa.parse(raw, { header: true, skipEmptyLines: true });
  if (errors.length) console.log(`  ⚠ Parse warnings in ${filename}:`, errors.map(e => e.message));
  return data;
}

function extractYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

async function fetchYouTubeThumbnail(videoId) {
  for (const quality of ['maxresdefault', 'sddefault', 'hqdefault']) {
    const url = `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
    try {
      const res = await fetch(url);
      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        return { buffer, quality };
      }
    } catch {}
  }
  return null;
}

async function uploadBuffer(slug, buffer, ext, contentType) {
  const storagePath = `${slug}${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType, upsert: true });
  if (error) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

async function uploadThumbnail(slug, filename, youtubeLink) {
  // 1. Local file override (if specified + exists)
  if (filename) {
    const filepath = path.join(THUMBNAILS_DIR, filename);
    if (fs.existsSync(filepath)) {
      const buffer = fs.readFileSync(filepath);
      const ext = path.extname(filename).toLowerCase();
      const contentType =
        ext === '.png' ? 'image/png' :
        ext === '.webp' ? 'image/webp' :
        'image/jpeg';
      const url = await uploadBuffer(slug, buffer, ext, contentType);
      if (url) { console.log(`    🖼  local file`); return url; }
    } else {
      console.log(`    ⚠ thumbnail_file "${filename}" not found, falling back to YouTube`);
    }
  }

  // 2. YouTube thumbnail
  const videoId = extractYouTubeId(youtubeLink);
  if (videoId) {
    const yt = await fetchYouTubeThumbnail(videoId);
    if (yt) {
      const url = await uploadBuffer(slug, yt.buffer, '.jpg', 'image/jpeg');
      if (url) { console.log(`    🎬 youtube (${yt.quality})`); return url; }
    } else {
      console.log(`    ⚠ YouTube fetch failed for ${videoId}`);
    }
  }

  return null;
}

async function seedExercises() {
  console.log('\n📋 Seeding exercises...');
  const rows = readCSV('exercises.csv');
  const nameToId = {};

  for (const row of rows) {
    const { slug, name, workout_type, muscles, youtube_link, instructions, thumbnail_file } = row;
    if (!slug || !name) continue;

    process.stdout.write(`  • ${name} ... `);
    const thumbnail_url = await uploadThumbnail(slug, thumbnail_file, youtube_link);

    const musclesArr = muscles
      ? muscles.split(/[,;]/).map(m => m.trim()).filter(Boolean)
      : [];

    const { data, error } = await supabase
      .from('exercises')
      .upsert(
        {
          name,
          workout_type,
          muscles_involved: musclesArr,
          youtube_link,
          instructions,
          thumbnail_url,
        },
        { onConflict: 'name' }
      )
      .select('id')
      .single();

    if (error) {
      console.log(`✗ ${error.message}`);
    } else {
      nameToId[name] = data.id;
      console.log('✓');
    }
  }
  return nameToId;
}

async function seedTemplates() {
  console.log('\n📋 Seeding workout templates...');
  const rows = readCSV('workout_templates.csv');
  const nameToId = {};

  for (const row of rows) {
    const { name, type, description } = row;
    if (!name) continue;

    process.stdout.write(`  • ${name} ... `);
    const { data, error } = await supabase
      .from('workout_templates')
      .upsert({ name, type, description }, { onConflict: 'name' })
      .select('id')
      .single();

    if (error) {
      console.log(`✗ ${error.message}`);
    } else {
      nameToId[name] = data.id;
      console.log('✓');
    }
  }
  return nameToId;
}

async function seedTemplateExercises(templateMap, exerciseMap) {
  console.log('\n🔗 Linking exercises to templates...');
  const rows = readCSV('template_exercises.csv');

  for (const row of rows) {
    const { template_name, exercise_name, sets, reps_range, sort_order } = row;
    if (!template_name || !exercise_name) continue;

    const template_id = templateMap[template_name];
    const exercise_id = exerciseMap[exercise_name];
    if (!template_id || !exercise_id) {
      console.log(`  ✗ Missing: ${template_name} → ${exercise_name} (check names match)`);
      continue;
    }

    process.stdout.write(`  • ${template_name} → ${exercise_name} ... `);
    const { error } = await supabase
      .from('template_exercises')
      .upsert(
        {
          template_id,
          exercise_id,
          sets: parseInt(sets, 10),
          reps_range,
          sort_order: parseInt(sort_order, 10),
        },
        { onConflict: 'template_id,exercise_id' }
      );

    if (error) console.log(`✗ ${error.message}`);
    else console.log('✓');
  }
}

async function seedWeeklySchedule(templateMap) {
  console.log('\n📅 Seeding weekly schedule...');
  const rows = readCSV('weekly_schedule.csv');

  for (const row of rows) {
    const { day_of_week, template_name, is_rest_day } = row;
    if (day_of_week === '' || day_of_week === undefined) continue;

    const dow = parseInt(day_of_week, 10);
    const template_id = template_name ? templateMap[template_name] : null;
    const restDay = ['true', '1', 'yes'].includes(String(is_rest_day).toLowerCase());

    if (template_name && !template_id) {
      console.log(`  ✗ Day ${dow}: template "${template_name}" not found`);
      continue;
    }

    process.stdout.write(`  • Day ${dow} → ${template_name || 'rest'} ... `);
    const { error } = await supabase
      .from('weekly_schedule')
      .upsert(
        { day_of_week: dow, template_id, is_rest_day: restDay },
        { onConflict: 'day_of_week' }
      );

    if (error) console.log(`✗ ${error.message}`);
    else console.log('✓');
  }
}

async function main() {
  console.log('🌱 Seeding Supabase from CSV...');
  const exerciseMap = await seedExercises();
  const templateMap = await seedTemplates();
  await seedTemplateExercises(templateMap, exerciseMap);
  await seedWeeklySchedule(templateMap);
  console.log('\n✅ Done.\n');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
