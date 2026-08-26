import { db } from './connection';
import { migrate } from './migrate';

type EventType = 'view' | 'click' | 'add_to_cart';

// Foxtale catalog (foxtale-consumer.myshopify.com/products.json).
// Prices are integer rupees. The niacinamide 30ml uses ₹645 from the
// shoppable reel overlay; the public JSON also lists a 10ml mini at ₹249.
const PRODUCTS = [
  { name: '12% Niacinamide Clarifying Serum', price: 645 },
  { name: 'Cherry-Collagen Clay Mask', price: 649 },
  { name: 'Vitamin C Brightening Moisturizer', price: 545 },
  { name: 'Ice-burst SPF 50 Matte Gel Sunscreen', price: 399 },
  { name: 'Glow Sunscreen SPF 50', price: 375 },
  { name: 'Super Glow Face Wash', price: 199 },
] as const;

const VIDEOS: Array<{ productName: string; title: string; videoUrl: string }> = [
  {
    productName: '12% Niacinamide Clarifying Serum',
    title: 'Azelaic Acid. Apply, wait.',
    videoUrl: 'https://cdn.videoselz.dev/ugc/foxtale-niacinamide-apply.mp4',
  },
  {
    productName: '12% Niacinamide Clarifying Serum',
    title: '12% Niacinamide — week two',
    videoUrl: 'https://cdn.videoselz.dev/ugc/foxtale-niacinamide-week2.mp4',
  },
  {
    productName: '12% Niacinamide Clarifying Serum',
    title: 'T-zone oil, this serum',
    videoUrl: 'https://cdn.videoselz.dev/ugc/foxtale-niacinamide-tzone.mp4',
  },
  {
    productName: 'Cherry-Collagen Clay Mask',
    title: 'Cherry-collagen, ten minutes',
    videoUrl: 'https://cdn.videoselz.dev/ugc/foxtale-clay-ten.mp4',
  },
  {
    productName: 'Cherry-Collagen Clay Mask',
    title: 'Sunday clay mask reset',
    videoUrl: 'https://cdn.videoselz.dev/ugc/foxtale-clay-sunday.mp4',
  },
  {
    productName: 'Vitamin C Brightening Moisturizer',
    title: 'Moisturizer that sits under SPF',
    videoUrl: 'https://cdn.videoselz.dev/ugc/foxtale-moist-spf.mp4',
  },
  {
    productName: 'Vitamin C Brightening Moisturizer',
    title: 'Papaya enzyme AM',
    videoUrl: 'https://cdn.videoselz.dev/ugc/foxtale-moist-am.mp4',
  },
  {
    productName: 'Ice-burst SPF 50 Matte Gel Sunscreen',
    title: 'Matte gel SPF, oily skin',
    videoUrl: 'https://cdn.videoselz.dev/ugc/foxtale-iceburst-matte.mp4',
  },
  {
    productName: 'Ice-burst SPF 50 Matte Gel Sunscreen',
    title: 'No white cast, SPF 50',
    videoUrl: 'https://cdn.videoselz.dev/ugc/foxtale-iceburst-cast.mp4',
  },
  {
    productName: 'Glow Sunscreen SPF 50',
    title: 'Glow sunscreen, in-vivo 50',
    videoUrl: 'https://cdn.videoselz.dev/ugc/foxtale-glow-spf.mp4',
  },
  {
    productName: 'Super Glow Face Wash',
    title: 'Super glow face wash',
    videoUrl: 'https://cdn.videoselz.dev/ugc/foxtale-wash-glow.mp4',
  },
  {
    productName: 'Super Glow Face Wash',
    title: 'Double cleanse, 50ml',
    videoUrl: 'https://cdn.videoselz.dev/ugc/foxtale-wash-double.mp4',
  },
];

// Per-clip volume + funnel mix. The niacinamide apply reel is the closer.
const VIDEO_PROFILES: Record<string, { events: number; view: number; click: number; add_to_cart: number }> = {
  'Azelaic Acid. Apply, wait.': { events: 480, view: 0.67, click: 0.22, add_to_cart: 0.11 },
  '12% Niacinamide — week two': { events: 310, view: 0.72, click: 0.2, add_to_cart: 0.08 },
  'T-zone oil, this serum': { events: 220, view: 0.75, click: 0.18, add_to_cart: 0.07 },
  'Cherry-collagen, ten minutes': { events: 360, view: 0.7, click: 0.21, add_to_cart: 0.09 },
  'Sunday clay mask reset': { events: 180, view: 0.78, click: 0.16, add_to_cart: 0.06 },
  'Moisturizer that sits under SPF': { events: 290, view: 0.73, click: 0.19, add_to_cart: 0.08 },
  'Papaya enzyme AM': { events: 150, view: 0.8, click: 0.15, add_to_cart: 0.05 },
  'Matte gel SPF, oily skin': { events: 340, view: 0.71, click: 0.2, add_to_cart: 0.09 },
  'No white cast, SPF 50': { events: 210, view: 0.76, click: 0.17, add_to_cart: 0.07 },
  'Glow sunscreen, in-vivo 50': { events: 160, view: 0.81, click: 0.14, add_to_cart: 0.05 },
  'Super glow face wash': { events: 250, view: 0.74, click: 0.18, add_to_cart: 0.08 },
  'Double cleanse, 50ml': { events: 90, view: 0.84, click: 0.12, add_to_cart: 0.04 },
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
