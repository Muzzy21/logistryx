const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'pin-images');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Brand colours
const BRAND = {
  primary: '#1a1a2e',    // dark navy
  accent: '#f59e0b',     // amber
  light: '#f8fafc',
  white: '#ffffff',
  muted: '#64748b',
};

// Pin templates
function reviewPin({ title, subtitle, rating, overlay, filename }) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 1000px; height: 1500px; font-family: 'Inter', system-ui, -apple-system, sans-serif; overflow: hidden; }
.pin {
  width: 1000px; height: 1500px;
  background: linear-gradient(160deg, ${BRAND.primary} 0%, #0f3460 60%, #16213e 100%);
  display: flex; flex-direction: column; align-items: center; justify-content: space-between;
  padding: 60px 60px 70px;
  position: relative;
}
.logo {
  font-size: 28px; font-weight: 800; color: ${BRAND.accent};
  letter-spacing: 1px; text-transform: uppercase;
  padding: 14px 28px; border: 2px solid ${BRAND.accent};
  border-radius: 8px; align-self: flex-start;
}
.badge {
  background: ${BRAND.accent}; color: ${BRAND.primary};
  font-size: 22px; font-weight: 700; padding: 10px 24px;
  border-radius: 30px; text-transform: uppercase; letter-spacing: 1px;
}
.main {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center; padding: 50px 0;
  gap: 30px;
}
.icon { font-size: 100px; }
.overlay {
  font-size: 72px; font-weight: 900; color: ${BRAND.white};
  line-height: 1.1; max-width: 820px;
}
.subtitle {
  font-size: 34px; font-weight: 400; color: rgba(255,255,255,0.75);
  max-width: 750px; line-height: 1.4;
}
.rating-row {
  display: flex; gap: 8px; align-items: center;
  background: rgba(255,255,255,0.1); padding: 16px 30px;
  border-radius: 50px;
}
.stars { font-size: 36px; color: ${BRAND.accent}; }
.rating-val { font-size: 32px; font-weight: 700; color: ${BRAND.white}; }
.cta {
  background: ${BRAND.accent}; color: ${BRAND.primary};
  font-size: 30px; font-weight: 800; padding: 22px 50px;
  border-radius: 50px; letter-spacing: 0.5px;
  text-transform: uppercase;
}
.url { font-size: 24px; color: rgba(255,255,255,0.5); letter-spacing: 1px; }
.stripe {
  position: absolute; bottom: 0; left: 0; right: 0; height: 8px;
  background: ${BRAND.accent};
}
</style>
</head>
<body>
<div class="pin">
  <div class="logo">Logistryx</div>
  <div class="badge">⭐ Review</div>
  <div class="main">
    <div class="icon">⚡</div>
    <div class="overlay">${overlay}</div>
    <div class="subtitle">${subtitle}</div>
    ${rating ? `<div class="rating-row"><span class="stars">★★★★★</span><span class="rating-val">${rating}/5</span></div>` : ''}
  </div>
  <div class="cta">Read the Full Review →</div>
  <div class="url">logistryx.com</div>
  <div class="stripe"></div>
</div>
</body>
</html>`;
}

function comparisonPin({ overlay, subtitle, filename }) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 1000px; height: 1500px; font-family: system-ui, -apple-system, sans-serif; overflow: hidden; }
.pin {
  width: 1000px; height: 1500px;
  background: linear-gradient(160deg, #0f3460 0%, #1a1a2e 100%);
  display: flex; flex-direction: column; align-items: center; justify-content: space-between;
  padding: 60px 60px 70px; position: relative;
}
.logo { font-size: 28px; font-weight: 800; color: ${BRAND.accent}; letter-spacing: 1px; text-transform: uppercase; padding: 14px 28px; border: 2px solid ${BRAND.accent}; border-radius: 8px; align-self: flex-start; }
.badge { background: #3b82f6; color: white; font-size: 22px; font-weight: 700; padding: 10px 24px; border-radius: 30px; text-transform: uppercase; letter-spacing: 1px; }
.vs-block { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 40px; padding: 50px 0; }
.vs { font-size: 120px; font-weight: 900; color: ${BRAND.accent}; line-height: 1; }
.overlay { font-size: 64px; font-weight: 900; color: white; line-height: 1.1; text-align: center; max-width: 820px; }
.subtitle { font-size: 32px; color: rgba(255,255,255,0.7); text-align: center; max-width: 750px; line-height: 1.4; }
.cta { background: ${BRAND.accent}; color: ${BRAND.primary}; font-size: 30px; font-weight: 800; padding: 22px 50px; border-radius: 50px; text-transform: uppercase; }
.url { font-size: 24px; color: rgba(255,255,255,0.5); letter-spacing: 1px; }
.stripe { position: absolute; bottom: 0; left: 0; right: 0; height: 8px; background: #3b82f6; }
</style>
</head>
<body>
<div class="pin">
  <div class="logo">Logistryx</div>
  <div class="badge">⚔️ Comparison</div>
  <div class="vs-block">
    <div class="vs">VS</div>
    <div class="overlay">${overlay}</div>
    <div class="subtitle">${subtitle}</div>
  </div>
  <div class="cta">See Who Wins →</div>
  <div class="url">logistryx.com</div>
  <div class="stripe"></div>
</div>
</body>
</html>`;
}

function guidePin({ overlay, subtitle, icon, filename }) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 1000px; height: 1500px; font-family: system-ui, -apple-system, sans-serif; overflow: hidden; }
.pin {
  width: 1000px; height: 1500px;
  background: linear-gradient(160deg, #064e3b 0%, #065f46 50%, #047857 100%);
  display: flex; flex-direction: column; align-items: center; justify-content: space-between;
  padding: 60px 60px 70px; position: relative;
}
.logo { font-size: 28px; font-weight: 800; color: ${BRAND.accent}; letter-spacing: 1px; text-transform: uppercase; padding: 14px 28px; border: 2px solid ${BRAND.accent}; border-radius: 8px; align-self: flex-start; }
.badge { background: #10b981; color: white; font-size: 22px; font-weight: 700; padding: 10px 24px; border-radius: 30px; text-transform: uppercase; letter-spacing: 1px; }
.main { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 40px; padding: 50px 0; text-align: center; }
.icon { font-size: 110px; }
.overlay { font-size: 68px; font-weight: 900; color: white; line-height: 1.1; max-width: 820px; }
.subtitle { font-size: 32px; color: rgba(255,255,255,0.8); max-width: 750px; line-height: 1.4; }
.cta { background: ${BRAND.accent}; color: ${BRAND.primary}; font-size: 30px; font-weight: 800; padding: 22px 50px; border-radius: 50px; text-transform: uppercase; }
.url { font-size: 24px; color: rgba(255,255,255,0.5); letter-spacing: 1px; }
.stripe { position: absolute; bottom: 0; left: 0; right: 0; height: 8px; background: #10b981; }
</style>
</head>
<body>
<div class="pin">
  <div class="logo">Logistryx</div>
  <div class="badge">📖 Guide</div>
  <div class="main">
    <div class="icon">${icon || '🔌'}</div>
    <div class="overlay">${overlay}</div>
    <div class="subtitle">${subtitle}</div>
  </div>
  <div class="cta">Read the Guide →</div>
  <div class="url">logistryx.com</div>
  <div class="stripe"></div>
</div>
</body>
</html>`;
}

function buyerPin({ overlay, subtitle, icon, filename }) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 1000px; height: 1500px; font-family: system-ui, -apple-system, sans-serif; overflow: hidden; }
.pin {
  width: 1000px; height: 1500px;
  background: linear-gradient(160deg, #4c1d95 0%, #5b21b6 50%, #7c3aed 100%);
  display: flex; flex-direction: column; align-items: center; justify-content: space-between;
  padding: 60px 60px 70px; position: relative;
}
.logo { font-size: 28px; font-weight: 800; color: ${BRAND.accent}; letter-spacing: 1px; text-transform: uppercase; padding: 14px 28px; border: 2px solid ${BRAND.accent}; border-radius: 8px; align-self: flex-start; }
.badge { background: #7c3aed; color: white; border: 2px solid rgba(255,255,255,0.4); font-size: 22px; font-weight: 700; padding: 10px 24px; border-radius: 30px; text-transform: uppercase; letter-spacing: 1px; }
.main { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 40px; padding: 50px 0; text-align: center; }
.icon { font-size: 110px; }
.overlay { font-size: 68px; font-weight: 900; color: white; line-height: 1.1; max-width: 820px; }
.subtitle { font-size: 32px; color: rgba(255,255,255,0.8); max-width: 750px; line-height: 1.4; }
.cta { background: ${BRAND.accent}; color: ${BRAND.primary}; font-size: 30px; font-weight: 800; padding: 22px 50px; border-radius: 50px; text-transform: uppercase; }
.url { font-size: 24px; color: rgba(255,255,255,0.5); letter-spacing: 1px; }
.stripe { position: absolute; bottom: 0; left: 0; right: 0; height: 8px; background: ${BRAND.accent}; }
</style>
</head>
<body>
<div class="pin">
  <div class="logo">Logistryx</div>
  <div class="badge">🛒 Buying Guide</div>
  <div class="main">
    <div class="icon">${icon || '⚡'}</div>
    <div class="overlay">${overlay}</div>
    <div class="subtitle">${subtitle}</div>
  </div>
  <div class="cta">Find Your Perfect Charger →</div>
  <div class="url">logistryx.com</div>
  <div class="stripe"></div>
</div>
</body>
</html>`;
}

// All pins to generate
const pins = [
  // ── REVIEWS ──
  { type:'review', file:'ohme-home-pro-1', overlay:'Ohme Home Pro: The Smartest Charger in 2026?', subtitle:'Independent UK review — smart tariff integration, app quality, and OZEV eligibility tested', rating:'4.9' },
  { type:'review', file:'ohme-home-pro-2', overlay:'Save Hundreds on EV Charging with Ohme', subtitle:'How the Ohme Home Pro pays for itself through Intelligent Octopus Go integration', rating:'4.9' },
  { type:'review', file:'ohme-home-pro-3', overlay:'Ohme Home Pro vs the Competition', subtitle:'Our top-rated UK home EV charger — rated 4.9/5 for a reason', rating:'4.9' },

  { type:'review', file:'pod-point-1', overlay:'Pod Point Solo 3: Still the Best Value?', subtitle:'One of the UK\'s most popular chargers — but is it still worth it in 2026?', rating:'4.6' },
  { type:'review', file:'pod-point-2', overlay:'Pod Point Solo 3 — Honest Review 2026', subtitle:'Reliable, affordable, widely trusted. Our full hands-on assessment', rating:'4.6' },
  { type:'review', file:'pod-point-3', overlay:'Best Value EV Charger UK 2026', subtitle:'The Pod Point Solo 3 remains the go-to budget option for UK homeowners', rating:'4.6' },

  { type:'review', file:'andersen-a2-1', overlay:'Andersen A2: The Premium EV Charger Worth Every Penny?', subtitle:'Beautiful British design with serious smart features — but is the price justified?', rating:'4.8' },
  { type:'review', file:'andersen-a2-2', overlay:'Most Beautiful EV Charger in the UK', subtitle:'The Andersen A2 is a statement piece — and a seriously capable charger too', rating:'4.8' },
  { type:'review', file:'andersen-a2-3', overlay:'Andersen A2 Review — Premium Pick 2026', subtitle:'10-year warranty, stunning design, and smart features. Our premium recommendation', rating:'4.8' },

  { type:'review', file:'wallbox-1', overlay:'Wallbox Pulsar Plus: Worth It for UK Homes?', subtitle:'Compact, sleek, and app-connected — but there are some caveats. Full review inside', rating:'4.0' },
  { type:'review', file:'wallbox-2', overlay:'Wallbox Pulsar Plus — Honest UK Review', subtitle:'What the reviews don\'t tell you about customer support and smart tariff limits', rating:'4.0' },
  { type:'review', file:'wallbox-3', overlay:'Is the Wallbox Pulsar Plus the Right Charger for You?', subtitle:'Great hardware, some compromises. Find out if it suits your needs', rating:'4.0' },

  { type:'review', file:'zappi-1', overlay:'Zappi v2: Best Solar EV Charger in the UK?', subtitle:'Three charging modes, solar divert, and myenergi ecosystem — full review 2026', rating:'4.7' },
  { type:'review', file:'zappi-2', overlay:'Charge Your EV FREE with Solar Panels', subtitle:'The myenergi Zappi v2 can use 100% solar energy — here\'s how it works', rating:'4.7' },
  { type:'review', file:'zappi-3', overlay:'myenergi Zappi Review — Solar-First Charging', subtitle:'Eco mode, Eco+ mode, solar divert — the Zappi explained for UK homeowners', rating:'4.7' },

  { type:'review', file:'easee-1', overlay:'Easee One: Stunning Design, But How\'s the App?', subtitle:'Scandinavian minimalism meets smart charging. Our honest Easee One review', rating:'4.3' },
  { type:'review', file:'easee-2', overlay:'Easee One — Best EV Charger for Flats?', subtitle:'Multi-charger load balancing makes the Easee ideal for apartment buildings', rating:'4.3' },
  { type:'review', file:'easee-3', overlay:'Easee One Review 2026 — Is It Worth £849?', subtitle:'Beautiful hardware, powerful features — but smart tariff integration lags behind', rating:'4.3' },

  { type:'review', file:'hypervolt-1', overlay:'Hypervolt Home 3 Pro: UK\'s Best All-Rounder?', subtitle:'Award-winning smart charger with Octopus integration and solar compatibility. Reviewed', rating:'4.6' },
  { type:'review', file:'hypervolt-2', overlay:'Why the Hypervolt Keeps Winning Awards', subtitle:'The Hypervolt Home 3 Pro ticks nearly every box — and the app is excellent', rating:'4.6' },
  { type:'review', file:'hypervolt-3', overlay:'Hypervolt Home 3 Pro Review 2026', subtitle:'Solar, smart tariffs, and a standout app. One of our top UK charger picks', rating:'4.6' },

  { type:'review', file:'simpson-1', overlay:'Simpson & Partners V3: Premium Worth the Price?', subtitle:'10-year warranty, stunning looks, and Auto Express recommended. Is it worth it?', rating:'4.5' },
  { type:'review', file:'simpson-2', overlay:'Most Reliable EV Charger UK 2026', subtitle:'Simpson & Partners backs their charger with a decade of cover. Find out why', rating:'4.5' },
  { type:'review', file:'simpson-3', overlay:'Simpson & Partners Home Series V3 Review', subtitle:'The premium choice for homeowners who want quality and longevity', rating:'4.5' },

  { type:'review', file:'rolec-1', overlay:'Best Budget EV Charger UK — Rolec WallPod', subtitle:'Not every charger needs smart features. The Rolec WallPod keeps it simple', rating:'3.8' },
  { type:'review', file:'rolec-2', overlay:'Rolec WallPod: Reliable & Affordable Charging', subtitle:'Basic but dependable — the go-to budget pick for UK homeowners in 2026', rating:'3.8' },
  { type:'review', file:'rolec-3', overlay:'Do You Really Need a Smart EV Charger?', subtitle:'The Rolec WallPod proves basic charging can still be great value', rating:'3.8' },

  // ── COMPARISONS ──
  { type:'comparison', file:'ohme-vs-podpoint-1', overlay:'Ohme Home Pro vs Pod Point Solo 3', subtitle:'Which UK charger should you actually buy? We compare every feature' },
  { type:'comparison', file:'ohme-vs-podpoint-2', overlay:'Smart Tariff vs Best Value — Which Wins?', subtitle:'Ohme vs Pod Point — the two most popular UK home chargers go head-to-head' },
  { type:'comparison', file:'ohme-vs-podpoint-3', overlay:'UK\'s Two Most Popular Chargers Compared', subtitle:'Ohme or Pod Point? Our detailed comparison picks a clear winner for each buyer' },

  { type:'comparison', file:'ohme-vs-easee-1', overlay:'Ohme Home Pro vs Easee One 2026', subtitle:'Smart tariffs vs Scandinavian design — which premium charger is right for you?' },
  { type:'comparison', file:'ohme-vs-easee-2', overlay:'Which Smart Charger Saves More Money?', subtitle:'Ohme wins for tariff integration, Easee wins for flats. Full comparison inside' },
  { type:'comparison', file:'ohme-vs-easee-3', overlay:'Ohme vs Easee — The Premium Showdown', subtitle:'Two of the UK\'s best smart chargers compared across 12 categories' },

  { type:'comparison', file:'zappi-vs-ohme-1', overlay:'Zappi vs Ohme — Solar vs Smart Tariffs', subtitle:'Which is better for solar panel owners? We break down every difference' },
  { type:'comparison', file:'zappi-vs-ohme-2', overlay:'Best EV Charger for Solar Panels UK', subtitle:'Zappi divert mode vs Ohme solar priority — which saves you more?' },
  { type:'comparison', file:'zappi-vs-ohme-3', overlay:'Should Solar Owners Buy Zappi or Ohme?', subtitle:'The definitive comparison for UK homeowners with solar PV panels' },

  { type:'comparison', file:'wallbox-vs-podpoint-1', overlay:'Wallbox Pulsar Plus vs Pod Point Solo 3', subtitle:'Compact European style vs trusted UK favourite — who wins in 2026?' },
  { type:'comparison', file:'wallbox-vs-podpoint-2', overlay:'Which Is Better: Wallbox or Pod Point?', subtitle:'We compare price, app, smart features, and installation in full detail' },
  { type:'comparison', file:'wallbox-vs-podpoint-3', overlay:'Wallbox vs Pod Point — UK Buyer\'s Guide', subtitle:'Two solid chargers, very different strengths. Find out which suits your home' },

  { type:'comparison', file:'easee-vs-hypervolt-1', overlay:'Easee One vs Hypervolt Home 3 Pro', subtitle:'Two premium smart chargers fight it out — apps, solar, tariffs, and design compared' },
  { type:'comparison', file:'easee-vs-hypervolt-2', overlay:'Smart Charger Showdown 2026', subtitle:'Easee or Hypervolt? We put both through their paces for UK homeowners' },
  { type:'comparison', file:'easee-vs-hypervolt-3', overlay:'Which Premium Charger Is Worth Your Money?', subtitle:'Easee vs Hypervolt — our head-to-head picks a winner for most buyers' },

  { type:'comparison', file:'zappi-vs-wallbox-1', overlay:'Zappi vs Wallbox Pulsar Plus 2026', subtitle:'Solar divert vs compact smart charging — two completely different philosophies' },
  { type:'comparison', file:'zappi-vs-wallbox-2', overlay:'Solar-First or Smart Tariff? You Choose', subtitle:'Zappi for solar maximisers, Wallbox for compact smart charging. Which are you?' },
  { type:'comparison', file:'zappi-vs-wallbox-3', overlay:'Zappi or Wallbox — Which Should You Buy?', subtitle:'Our detailed 2026 comparison helps you pick the right charger for your home' },

  // ── BUYER GUIDES ──
  { type:'buyer', file:'best-overall-1', icon:'🏆', overlay:'Best Home EV Chargers UK 2026', subtitle:'Our top 7 picks across every budget — reviewed, tested, and ranked' },
  { type:'buyer', file:'best-overall-2', icon:'⚡', overlay:'Which EV Charger Should You Buy in 2026?', subtitle:'Expert comparison of every major UK home charger — find your perfect match' },
  { type:'buyer', file:'best-overall-3', icon:'🔌', overlay:'Top 7 UK Home EV Chargers Ranked', subtitle:'From budget to premium — every charger you need to know about in one guide' },

  { type:'buyer', file:'tesla-1', icon:'🚗', overlay:'Best EV Charger for Tesla Owners UK', subtitle:'Tesla Wall Connector vs Ohme vs Zappi — which is best for your Tesla in 2026?' },
  { type:'buyer', file:'tesla-2', icon:'⚡', overlay:'Should Tesla Owners Use a Third-Party Charger?', subtitle:'We compare the Tesla Wall Connector against the UK\'s best alternatives' },
  { type:'buyer', file:'tesla-3', icon:'🔌', overlay:'Save Money Charging Your Tesla at Home', subtitle:'The best chargers for Intelligent Octopus Go and smart tariff savings' },

  { type:'buyer', file:'flats-1', icon:'🏢', overlay:'Can You Get an EV Charger in a Flat?', subtitle:'Leaseholder rights, OZEV grants, and the best chargers for apartments in 2026' },
  { type:'buyer', file:'flats-2', icon:'🔌', overlay:'Best EV Charger for Flats & Apartments UK', subtitle:'Yes, flat dwellers can charge at home. Here\'s exactly how to make it happen' },
  { type:'buyer', file:'flats-3', icon:'🏠', overlay:'EV Charging for Renters & Leaseholders UK', subtitle:'Your rights, the OZEV grant, and how to convince your building management' },

  { type:'buyer', file:'tariff-1', icon:'💡', overlay:'Best EV Charger for Octopus Intelligent Go', subtitle:'Which chargers work with smart tariffs and can charge for as little as 3.5p/kWh?' },
  { type:'buyer', file:'tariff-2', icon:'💰', overlay:'Charge Your EV for 3.5p Per kWh', subtitle:'The smart chargers that unlock Octopus Intelligent Go\'s rock-bottom night rates' },
  { type:'buyer', file:'tariff-3', icon:'⚡', overlay:'Smart Tariff Compatible EV Chargers UK 2026', subtitle:'Not every charger unlocks cheap electricity rates — here\'s which ones do' },

  { type:'buyer', file:'budget-1', icon:'💸', overlay:'Best Budget EV Charger UK Under £500', subtitle:'Ohme ePod vs Rolec vs EO Mini Pro — the best cheap chargers compared' },
  { type:'buyer', file:'budget-2', icon:'🔌', overlay:'Do You Need to Spend Over £700 on a Charger?', subtitle:'Honest guide to budget EV chargers — what you get and what you sacrifice' },
  { type:'buyer', file:'budget-3', icon:'💰', overlay:'Best Cheap EV Chargers UK 2026', subtitle:'Three-way budget comparison including total installed costs with OZEV grant' },

  { type:'buyer', file:'3phase-1', icon:'⚡', overlay:'22kW Home Charging — Is It Worth It?', subtitle:'Who actually has 3-phase power at home, and which chargers support it in the UK?' },
  { type:'buyer', file:'3phase-2', icon:'🔌', overlay:'Best 3-Phase EV Charger UK 2026', subtitle:'Zappi, Easee, Wallbox — the chargers that support 22kW AC home charging' },
  { type:'buyer', file:'3phase-3', icon:'🏠', overlay:'3-Phase vs Single-Phase EV Charging Explained', subtitle:'Is upgrading to 3-phase worth the cost? We crunch the numbers for UK homeowners' },

  { type:'buyer', file:'bycar-1', icon:'🚗', overlay:'Best EV Charger for VW, BMW & Hyundai', subtitle:'Car-specific recommendations for the UK\'s most popular electric vehicles' },
  { type:'buyer', file:'bycar-2', icon:'⚡', overlay:'Best Charger for VW ID.3, BMW i4 & Ioniq 5', subtitle:'Each car has different onboard charger limits — get the right charger for yours' },
  { type:'buyer', file:'bycar-3', icon:'🔌', overlay:'Which Charger Works Best With Your EV?', subtitle:'MG4, Kia EV6, Nissan Leaf, VW, BMW, Hyundai — all covered in one guide' },

  // ── GUIDES ──
  { type:'guide', file:'installation-1', icon:'🔧', overlay:'How Much Does EV Charger Installation Cost?', subtitle:'Real UK costs, what affects the price, and how to avoid overpaying in 2026' },
  { type:'guide', file:'installation-2', icon:'💷', overlay:'EV Charger Installation: Real UK Prices 2026', subtitle:'From £500 to £1,500+ — what determines your installation cost?' },
  { type:'guide', file:'installation-3', icon:'🏠', overlay:'Don\'t Get Ripped Off on EV Charger Installation', subtitle:'What to look for in an installer, and the typical costs you should expect to pay' },

  { type:'guide', file:'ozev-1', icon:'💰', overlay:'Get £350 Off Your EV Charger — OZEV Grant', subtitle:'Most UK homeowners qualify. Here\'s exactly how to claim the government grant' },
  { type:'guide', file:'ozev-2', icon:'🏛️', overlay:'Free Money for Your EV Charger — OZEV 2026', subtitle:'Step-by-step guide to claiming the OZEV Electric Vehicle Chargepoint Grant' },
  { type:'guide', file:'ozev-3', icon:'✅', overlay:'Do You Qualify for the OZEV EV Grant?', subtitle:'Check eligibility, choose an approved installer, and save up to £350 on installation' },

  { type:'guide', file:'level-1', icon:'⚡', overlay:'Level 1 vs Level 2 EV Charger Explained', subtitle:'3-pin vs 7kW wall charger — the plain-English guide for UK homeowners' },
  { type:'guide', file:'level-2', icon:'🔌', overlay:'Why You Need a Proper Home EV Charger', subtitle:'3-pin charging is 8x slower — here\'s why a Level 2 charger is worth it' },
  { type:'guide', file:'level-3', icon:'🏠', overlay:'7kW vs 3-Pin EV Charging: What\'s the Difference?', subtitle:'Speed, safety, cost — everything you need to know before buying a wall charger' },

  { type:'guide', file:'smart-1', icon:'📱', overlay:'What Is a Smart EV Charger?', subtitle:'And do you actually need one? We cut through the jargon for UK homeowners' },
  { type:'guide', file:'smart-2', icon:'💡', overlay:'Smart EV Chargers: Are They Worth the Extra Cost?', subtitle:'Schedule charging, track energy use, and slash your electricity bill. Here\'s how' },
  { type:'guide', file:'smart-3', icon:'🔌', overlay:'Smart vs Dumb EV Charger — Which Should You Buy?', subtitle:'The case for smart chargers explained simply for UK homeowners in 2026' },

  { type:'guide', file:'solar-1', icon:'☀️', overlay:'Charge Your EV FREE With Solar Panels', subtitle:'How to pair home solar panels with your EV charger and cut running costs to near zero' },
  { type:'guide', file:'solar-2', icon:'⚡', overlay:'Solar Panels + EV Charger: The UK Guide', subtitle:'Which chargers work best with solar PV, and how much can you actually save?' },
  { type:'guide', file:'solar-3', icon:'🏠', overlay:'Best EV Charger for Solar Panel Owners UK', subtitle:'Zappi, Ohme, or Hypervolt? The solar-compatible chargers compared' },

  { type:'guide', file:'cost-1', icon:'💷', overlay:'How Much Does It Cost to Charge an EV at Home?', subtitle:'Per kWh rates, cost per mile, and how smart tariffs can slash your bill in 2026' },
  { type:'guide', file:'cost-2', icon:'💰', overlay:'EV vs Petrol: The Real Running Cost Comparison', subtitle:'Charging at home vs petrol — we crunch the numbers for UK drivers in 2026' },
  { type:'guide', file:'cost-3', icon:'📊', overlay:'EV Charging Costs 2026 — Updated for New Rates', subtitle:'April 2026 electricity prices, Octopus rate changes, and cost per mile for 10 EVs' },

  { type:'guide', file:'tariff-guide-1', icon:'⚡', overlay:'Best EV Energy Tariff UK 2026', subtitle:'Octopus Go vs OVO vs British Gas — the cheapest rates for home EV charging' },
  { type:'guide', file:'tariff-guide-2', icon:'💡', overlay:'Get EV Electricity for 3.5p Per kWh', subtitle:'The best smart tariffs for UK EV drivers — compared and ranked for 2026' },
  { type:'guide', file:'tariff-guide-3', icon:'💰', overlay:'Which EV Tariff Saves the Most Money?', subtitle:'Off-peak rates, standing charges, and charger compatibility — all compared' },

  { type:'guide', file:'time-1', icon:'⏱️', overlay:'How Long to Charge an EV at Home UK?', subtitle:'Charging times for Tesla, VW, Hyundai, MG and more — at 3-pin, 7kW, and 22kW' },
  { type:'guide', file:'time-2', icon:'🔋', overlay:'Why Your EV Doesn\'t Charge at 7kW Speed', subtitle:'Onboard charger limits explained — and how to pick the right home charger' },
  { type:'guide', file:'time-3', icon:'⚡', overlay:'EV Charging Time Calculator UK 2026', subtitle:'How long to charge 12 popular electric cars from 20% to 80% at home' },

  { type:'guide', file:'planning-1', icon:'🏛️', overlay:'Do You Need Planning Permission for an EV Charger?', subtitle:'Permitted development rights, exceptions, and Scotland-specific rules explained' },
  { type:'guide', file:'planning-2', icon:'📋', overlay:'EV Charger Planning Permission UK Guide', subtitle:'Listed buildings, conservation areas, and flats — when you need permission' },
  { type:'guide', file:'planning-3', icon:'✅', overlay:'Most EV Chargers Don\'t Need Planning Permission', subtitle:'Here\'s exactly when you do — and don\'t — need planning approval in the UK' },

  { type:'guide', file:'loadbal-1', icon:'⚡', overlay:'What Is EV Charger Load Balancing?', subtitle:'CT clamps, dynamic balancing, and why your fuse box matters. Explained simply' },
  { type:'guide', file:'loadbal-2', icon:'🔌', overlay:'Stop Your EV Charger Tripping the Fuse Box', subtitle:'Load balancing prevents electrical overload — here\'s which chargers include it' },
  { type:'guide', file:'loadbal-3', icon:'🏠', overlay:'Dynamic Load Balancing: Do You Need It?', subtitle:'For most homes, yes. Here\'s why and which chargers support it in the UK' },

  { type:'guide', file:'v2g-1', icon:'🔋', overlay:'V2G Charging: Power Your Home From Your EV', subtitle:'Vehicle-to-grid is coming to the UK — here\'s what it means for EV owners in 2026' },
  { type:'guide', file:'v2g-2', icon:'⚡', overlay:'Can Your EV Power Your Home During Outages?', subtitle:'V2H and V2G explained — which cars and chargers support bidirectional charging' },
  { type:'guide', file:'v2g-3', icon:'🌍', overlay:'V2G UK 2026 — Is It Worth Waiting For?', subtitle:'Honest assessment of vehicle-to-grid technology and when it\'ll go mainstream' },

  { type:'guide', file:'market-1', icon:'📊', overlay:'UK EV Charger Market 2026: What\'s Changed?', subtitle:'New brands, smart tariff evolution, OZEV changes, and what\'s coming next' },
  { type:'guide', file:'market-2', icon:'🔮', overlay:'The Future of Home EV Charging in the UK', subtitle:'V2G, solar integration, smart tariffs — 6 predictions for 2026 and beyond' },
  { type:'guide', file:'market-3', icon:'⚡', overlay:'Which EV Charger Brands Are Winning in 2026?', subtitle:'Ohme, Hypervolt, Easee, Zappi — the UK market rankings and what\'s shifting' },

  { type:'guide', file:'workplace-1', icon:'🏢', overlay:'Free Money for Business EV Chargers — WCS Grant', subtitle:'UK small businesses can claim £500 per socket. Here\'s exactly how to apply' },
  { type:'guide', file:'workplace-2', icon:'💷', overlay:'Workplace EV Charging: The UK Business Guide', subtitle:'Tax benefits, grants, and the best chargers for UK small businesses in 2026' },
  { type:'guide', file:'workplace-3', icon:'🔌', overlay:'Should Your Business Install EV Chargers?', subtitle:'Employee benefits, tax relief, and the WCS grant — the business case explained' },
];

async function generatePins() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    headless: true,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 1500, deviceScaleFactor: 1 });

  let count = 0;
  for (const pin of pins) {
    let html;
    if (pin.type === 'review') html = reviewPin(pin);
    else if (pin.type === 'comparison') html = comparisonPin(pin);
    else if (pin.type === 'buyer') html = buyerPin(pin);
    else html = guidePin(pin);

    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 100));
    const outPath = path.join(outDir, `${pin.file}.png`);
    await page.screenshot({ path: outPath, type: 'png', clip: { x: 0, y: 0, width: 1000, height: 1500 } });
    count++;
    if (count % 10 === 0) process.stdout.write(`Generated ${count}/${pins.length}...\n`);
  }

  await browser.close();
  console.log(`\n✅ Done! Generated ${count} pin images in pin-images/`);
}

generatePins().catch(console.error);
