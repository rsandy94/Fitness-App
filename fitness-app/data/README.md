# Data / Seed CSV files

This folder is the **export target** for your Google Sheet. The seeder reads from here.

## Workflow

1. Open your Google Sheet (4 tabs: `exercises`, `workout_templates`, `template_exercises`, `weekly_schedule`)
2. Edit rows (make sure every exercise has a valid `youtube_link`)
3. **File → Download → Comma-separated values (.csv)** — pick the tab name when prompted
4. Save the CSV here, overwriting the previous version:
   - `data/exercises.csv`
   - `data/workout_templates.csv`
   - `data/template_exercises.csv`
   - `data/weekly_schedule.csv`
5. (Optional) Drop a custom thumbnail into `Thumbnails/` and set `thumbnail_file` in the CSV — otherwise the YouTube thumbnail is auto-fetched
6. Run `npm run seed`

## Weekly schedule

`day_of_week` values: `0`=Sun, `1`=Mon, `2`=Tue, `3`=Wed, `4`=Thu, `5`=Fri, `6`=Sat.

- Workout day: `template_name=Push, is_rest_day=false`
- Rest day: leave `template_name` empty, `is_rest_day=true`

The script matches by `day_of_week` (one row per day, 0-6). Rest days have no template linked.

The script is **idempotent** — safe to run repeatedly. It matches rows by `name`.

## Thumbnails

Auto-fetched from `youtube_link` by default (tries maxresdefault → sddefault → hqdefault). To override with a custom image:
1. Drop the image into `Thumbnails/`
2. Set `thumbnail_file` column to the filename (e.g. `my-custom.png`)

Local file wins over YouTube if both are specified. Thumbnails are uploaded as `{slug}.jpg` (or `{slug}.{ext}` for custom files) — Storage URLs stay stable across runs.

## Example files

See `data/example/` for sample rows based on the current Push template.

## Notes

- **Slug is just for the Storage filename** — it doesn't need to match the exercise name. Pick something stable and kebab-case (e.g. `bench-press`, `incline-db-press`).
- **`muscles` separator is `;`** (semicolon) — avoids CSV-quoting headaches inside the field.
- **Renaming an exercise** requires deleting the old DB row first (because `name` is the unique key).
- **YouTube link must point to a real video** — invalid IDs produce a 404 and the thumbnail will be null. Verify links before committing.
- **Delete an exercise** → delete the row from `exercises.csv` AND delete any rows in `template_exercises.csv` that reference it. Re-run seed (DB cascade handles cleanup, or run `npm run seed` twice).
