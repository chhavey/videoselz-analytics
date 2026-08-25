import { db } from './connection';
import { migrate } from './migrate';

type EventType = 'view' | 'click' | 'add_to_cart';

const PRODUCTS = [
  { name: 'Silk Slip Dress', price: 8900 },
  { name: 'Everyday Lace Bralette', price: 4200 },
  { name: 'Cloudfoam Runner', price: 12900 },
  { name: 'Merino Crew Sock Pack', price: 2400 },
  { name: 'Matte Lip Oil', price: 2800 },
  { name: 'Ceramic Pour-Over Set', price: 6400 },
] as const;

const VIDEOS: Array<{ productName: string; title: string; videoUrl: string }> = [
  {
    productName: 'Silk Slip Dress',
    title: 'Get ready with me — silk slip',
    videoUrl: 'https://cdn.videoselz.dev/ugc/silk-slip-grwm.mp4',
  },
  {
    productName: 'Silk Slip Dress',
    title: 'How it drapes in daylight',
    videoUrl: 'https://cdn.videoselz.dev/ugc/silk-slip-daylight.mp4',
  },
  {
    productName: 'Everyday Lace Bralette',
    title: 'Soft support, no straps showing',
    videoUrl: 'https://cdn.videoselz.dev/ugc/bralette-fit.mp4',
  },
  {
    productName: 'Everyday Lace Bralette',
    title: 'Three outfits, one bralette',
    videoUrl: 'https://cdn.videoselz.dev/ugc/bralette-outfits.mp4',
  },
  {
    productName: 'Cloudfoam Runner',
    title: 'Unboxing the Cloudfoam Runner',
    videoUrl: 'https://cdn.videoselz.dev/ugc/runner-unbox.mp4',
  },
  {
    productName: 'Cloudfoam Runner',
    title: '5K in the rain — still dry',
    videoUrl: 'https://cdn.videoselz.dev/ugc/runner-rain.mp4',
  },
  {
    productName: 'Merino Crew Sock Pack',
    title: 'Why merino over cotton',
    videoUrl: 'https://cdn.videoselz.dev/ugc/socks-merino.mp4',
  },
  {
    productName: 'Matte Lip Oil',
    title: 'One swipe, all-day tint',
    videoUrl: 'https://cdn.videoselz.dev/ugc/lip-oil-swipe.mp4',
  },
  {
    productName: 'Matte Lip Oil',
    title: 'Shade match: rosewood',
    videoUrl: 'https://cdn.videoselz.dev/ugc/lip-oil-rosewood.mp4',
  },
  {
    productName: 'Ceramic Pour-Over Set',
    title: 'Sunday pour-over ritual',
    videoUrl: 'https://cdn.videoselz.dev/ugc/pourover-sunday.mp4',
  },
  {
    productName: 'Ceramic Pour-Over Set',
    title: 'Bloom, pour, wait',
    videoUrl: 'https://cdn.videoselz.dev/ugc/pourover-bloom.mp4',
  },
  {
    productName: 'Cloudfoam Runner',
    title: 'On-foot review after 30 days',
    videoUrl: 'https://cdn.videoselz.dev/ugc/runner-30days.mp4',
  },
];

// Per-video event volume + funnel mix. High-intent UGC converts; reviews less so.
const VIDEO_PROFILES: Record<string, { events: number; view: number; click: number; add_to_cart: number }> = {
  'Get ready with me — silk slip': { events: 420, view: 0.72, click: 0.2, add_to_cart: 0.08 },
  'How it drapes in daylight': { events: 260, view: 0.78, click: 0.16, add_to_cart: 0.06 },
  'Soft support, no straps showing': { events: 310, view: 0.7, click: 0.21, add_to_cart: 0.09 },
  'Three outfits, one bralette': { events: 190, view: 0.74, click: 0.19, add_to_cart: 0.07 },
  'Unboxing the Cloudfoam Runner': { events: 540, view: 0.68, click: 0.23, add_to_cart: 0.09 },
  '5K in the rain — still dry': { events: 150, view: 0.8, click: 0.15, add_to_cart: 0.05 },
  'Why merino over cotton': { events: 90, view: 0.82, click: 0.14, add_to_cart: 0.04 },
  'One swipe, all-day tint': { events: 380, view: 0.69, click: 0.22, add_to_cart: 0.09 },
  'Shade match: rosewood': { events: 210, view: 0.73, click: 0.19, add_to_cart: 0.08 },
  'Sunday pour-over ritual': { events: 175, view: 0.76, click: 0.18, add_to_cart: 0.06 },
  'Bloom, pour, wait': { events: 80, view: 0.85, click: 0.12, add_to_cart: 0.03 },
  'On-foot review after 30 days': { events: 330, view: 0.71, click: 0.21, add_to_cart: 0.08 },
};

function pickEventType(weights: { view: number; click: number; add_to_cart: number }): EventType {
  const roll = Math.random();
  if (roll < weights.view) return 'view';
  if (roll < weights.view + weights.click) return 'click';
  return 'add_to_cart';
}

function randomTimestamp(daysBack: number): string {
  const now = Date.now();
  const past = now - Math.floor(Math.random() * daysBack * 24 * 60 * 60 * 1000);
  return new Date(past).toISOString().replace('T', ' ').slice(0, 19);
}

export function seed(options: { reset?: boolean } = {}): void {
  migrate();

  if (options.reset) {
    db.exec(`
      DELETE FROM engagement_events;
      DELETE FROM videos;
      DELETE FROM products;
    `);
    try {
      db.exec('DELETE FROM sqlite_sequence');
    } catch {
      // sqlite_sequence exists only after the first AUTOINCREMENT insert
    }
  }

  const productCount = db.prepare('SELECT COUNT(*) AS count FROM products').get() as { count: number };
  if (productCount.count > 0) {
    console.log('Database already seeded. Pass --reset to rebuild.');
    return;
  }

  const insertProduct = db.prepare(
    'INSERT INTO products (name, price, created_at) VALUES (@name, @price, @createdAt)'
  );
  const insertVideo = db.prepare(
    'INSERT INTO videos (product_id, video_url, title) VALUES (@productId, @videoUrl, @title)'
  );
  const insertEvent = db.prepare(
    'INSERT INTO engagement_events (video_id, event_type, timestamp) VALUES (@videoId, @eventType, @timestamp)'
  );

  const run = db.transaction(() => {
    const productIds = new Map<string, number>();

    for (const product of PRODUCTS) {
      const result = insertProduct.run({
        name: product.name,
        price: product.price,
        createdAt: randomTimestamp(40),
      });
      productIds.set(product.name, Number(result.lastInsertRowid));
    }

    for (const video of VIDEOS) {
      const productId = productIds.get(video.productName);
      if (!productId) throw new Error(`Missing product ${video.productName}`);

      const videoResult = insertVideo.run({
        productId,
        videoUrl: video.videoUrl,
        title: video.title,
      });
      const videoId = Number(videoResult.lastInsertRowid);
      const profile = VIDEO_PROFILES[video.title];

      for (let i = 0; i < profile.events; i += 1) {
        insertEvent.run({
          videoId,
          eventType: pickEventType(profile),
          timestamp: randomTimestamp(14),
        });
      }
    }
  });

  run();

  const totals = db
    .prepare(
      `SELECT
         (SELECT COUNT(*) FROM products) AS products,
         (SELECT COUNT(*) FROM videos) AS videos,
         (SELECT COUNT(*) FROM engagement_events) AS events`
    )
    .get() as { products: number; videos: number; events: number };

  console.log(
    `Seeded ${totals.products} products, ${totals.videos} videos, ${totals.events} engagement events.`
  );
}

if (require.main === module) {
  const reset = process.argv.includes('--reset');
  seed({ reset });
}
