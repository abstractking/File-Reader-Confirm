 import 'dotenv/config';
import { query } from '../core/db';
import { WebClient } from '@slack/web-api';
import JSZip from 'jszip';

async function main() {
  const slack   = new WebClient(process.env.SLACK_BOT_TOKEN!);
  const CHANNEL = process.env.SLACK_CHANNEL_ID!;

  console.log('CHANNEL:', CHANNEL ? CHANNEL.slice(0,8)+'...' : 'MISSING');

  const rows = await query(
    `SELECT a.* FROM assets a WHERE a.asset_type = 'site_code' ORDER BY a.created_at DESC LIMIT 1`,
    []
  );
  const asset = rows[0] as any;

  if (!asset) { console.log('❌ No site_code asset found in DB'); return; }

  console.log('✅ Asset found:', asset.title);
  console.log('   Content length:', asset.content?.length ?? 0, 'chars');
  console.log('   Created:', asset.created_at);

  const files: Record<string, string> = JSON.parse(asset.content ?? '{}');
  const fileKeys = Object.keys(files);
  console.log('   Files:', fileKeys.length);
  fileKeys.slice(0, 6).forEach(f => console.log('    •', f));

  const zip    = new JSZip();
  const folder = zip.folder('site')!;
  for (const [name, code] of Object.entries(files)) folder.file(name, code);

  const buf = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
  console.log('   Zip size:', buf.length, 'bytes');

  try {
    const r = await (slack as any).filesUploadV2({
      channel_id:      CHANNEL,
      filename:        'site.zip',
      file:            buf,
      initial_comment: '🧪 Test zip upload — debug script',
    });
    console.log('✅ Upload OK — file id:', r.files?.[0]?.id ?? r.file?.id ?? JSON.stringify(r).slice(0, 200));
  } catch (e: any) {
    console.error('❌ Upload FAILED:', e.message);
    if (e.data) console.error('   Slack data:', JSON.stringify(e.data).slice(0, 400));
    if (e.code) console.error('   Code:', e.code);
  }
}

main().catch(console.error);
