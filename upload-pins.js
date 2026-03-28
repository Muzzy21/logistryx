/**
 * Logistryx Pinterest Pin Uploader
 * Creates boards and uploads pins automatically
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const PIN_DIR = path.join(__dirname, 'pin-images');
const DELAY = ms => new Promise(r => setTimeout(r, ms));

// Board definitions
const BOARDS = [
  'Best EV Chargers UK 2026',
  'EV Charger Reviews UK',
  'EV Charger Comparisons',
  'EV Charging Guides & Tips',
  'Solar & EV Charging',
  'Money-Saving EV Tips',
  'EV Charger Installation UK',
  'Smart Home & EV Tech',
];

// All pins: [imageFile, title, description, board, link]
const PINS = [
  // ── OHME HOME PRO ──
  ['ohme-home-pro-1.png', 'Ohme Home Pro Review — Rated 4.9/5, Best UK Home EV Charger 2026', 'The Ohme Home Pro scored 4.9/5 in our independent testing — our top-rated home EV charger in the UK for 2026. Covers smart charging with Octopus, installation, app, and real-world speeds. Read the full review on Logistryx. #EVCharger #OhmeHomePro #HomeCharging #EVUK #ElectricCar', 'EV Charger Reviews UK', 'https://logistryx.com/reviews/ohme-home-pro-review/'],
  ['ohme-home-pro-2.png', 'Why the Ohme Home Pro Is the Best-Rated EV Charger in the UK', 'The Ohme Home Pro tops our rankings with a 4.9/5 rating. Smart, affordable, and works perfectly with Octopus Intelligent Go. Full review with pros, cons, and pricing at logistryx.com. #BestEVCharger #OhmeReview #SmartCharging #EVChargingUK #HomeEVCharger', 'Best EV Chargers UK 2026', 'https://logistryx.com/reviews/ohme-home-pro-review/'],
  ['ohme-home-pro-3.png', 'Ohme Home Pro — Full UK Review, Price & Smart Charging Features 2026', 'Honest, independent UK review of the Ohme Home Pro. Smart tariff charging, excellent app, straightforward installation. Is it worth the price? Read more on Logistryx. #EVChargerReview #Ohme #ElectricCarCharging #UKEV #ChargingAtHome', 'Smart Home & EV Tech', 'https://logistryx.com/reviews/ohme-home-pro-review/'],

  // ── POD POINT ──
  ['pod-point-1.png', 'Pod Point Solo 3 Review — Best Value EV Charger UK (4.6/5)', 'The Pod Point Solo 3 is our best value pick for UK home EV charging. Rated 4.6/5 — reliable 7kW charging, clean design, solid app. Full review at logistryx.com. #PodPoint #EVCharger #BestValueCharger #HomeChargingUK #ElectricVehicle', 'EV Charger Reviews UK', 'https://logistryx.com/reviews/pod-point-solo-3-review/'],
  ['pod-point-2.png', 'Is the Pod Point Solo 3 Worth It in 2026? Our Honest UK Review', 'We tested the Pod Point Solo 3 and rated it 4.6/5. Great price, reliable charging, straightforward app. Everything you need to know before buying. See the full breakdown on Logistryx. #PodPointReview #EVChargingUK #HomeEVCharger #BudgetEVCharger', 'Best EV Chargers UK 2026', 'https://logistryx.com/reviews/pod-point-solo-3-review/'],
  ['pod-point-3.png', 'Pod Point Solo 3 — Still the UK\'s Best Budget EV Charger?', 'One of the most popular home chargers in the UK — but is it still worth it in 2026? We find out in our full hands-on review. Logistryx. #PodPoint #BudgetEVCharger #EVChargingUK #HomeCharger', 'Money-Saving EV Tips', 'https://logistryx.com/reviews/pod-point-solo-3-review/'],

  // ── ANDERSEN A2 ──
  ['andersen-a2-1.png', 'Andersen A2 Review — The Luxury EV Charger Worth Every Penny? (4.8/5)', 'Beautiful British-made design, 10-year warranty, and serious smart features. Is the Andersen A2\'s premium price justified? Our full UK review on Logistryx. #AndersenA2 #PremiumEVCharger #EVChargerUK #HomeCharging', 'EV Charger Reviews UK', 'https://logistryx.com/reviews/andersen-a2-review/'],
  ['andersen-a2-2.png', 'Andersen A2 — The Most Beautiful EV Charger You Can Buy in the UK', 'Stunning wood and metal finishes, rock-solid build quality, and 4.8/5 in our tests. The Andersen A2 is a statement piece — and a seriously capable charger. Logistryx. #AndersenA2 #LuxuryCharger #BritishMade #EVCharger', 'Best EV Chargers UK 2026', 'https://logistryx.com/reviews/andersen-a2-review/'],
  ['andersen-a2-3.png', 'Andersen A2 UK Review 2026 — Premium EV Charger Tested', 'Our premium pick for 2026. 10-year warranty, stunning design, full smart features. Is it worth the extra cost? Find out at logistryx.com. #AndersenReview #PremiumEV #UKEVCharger #SmartCharger', 'Smart Home & EV Tech', 'https://logistryx.com/reviews/andersen-a2-review/'],

  // ── WALLBOX ──
  ['wallbox-1.png', 'Wallbox Pulsar Plus Review 2026 — Compact Smart Charger Tested (4.0/5)', 'Compact, sleek, app-connected — but are there hidden downsides? Our honest Wallbox Pulsar Plus review covers customer support, smart tariff limits, and real-world performance. Logistryx. #WallboxPulsarPlus #EVCharger #SmartCharging #HomeChargerUK', 'EV Charger Reviews UK', 'https://logistryx.com/reviews/wallbox-pulsar-plus-review/'],
  ['wallbox-2.png', 'Is the Wallbox Pulsar Plus Worth Buying in the UK?', 'Great hardware, some compromises. We rate the Wallbox 4.0/5 — find out exactly where it shines and where it falls short. Full review on Logistryx. #Wallbox #EVChargerReview #UKEVCharger #PulsarPlus', 'Best EV Chargers UK 2026', 'https://logistryx.com/reviews/wallbox-pulsar-plus-review/'],
  ['wallbox-3.png', 'Wallbox Pulsar Plus — Compact Charging for UK Homes', 'One of the smallest home EV chargers on the market. But does it deliver where it counts? Our detailed UK review. Logistryx. #WallboxReview #CompactCharger #EVCharging #UKHomes', 'EV Charger Installation UK', 'https://logistryx.com/reviews/wallbox-pulsar-plus-review/'],

  // ── ZAPPI ──
  ['zappi-1.png', 'myenergi Zappi v2 Review 2026 — Best Solar EV Charger UK? (4.7/5)', 'Three charging modes, solar divert, and myenergi ecosystem integration. The Zappi v2 rated 4.7/5 in our tests. Does it live up to the hype? Full UK review on Logistryx. #Zappi #myenergi #SolarCharging #EVChargerUK', 'Solar & EV Charging', 'https://logistryx.com/reviews/zappi-v2-review/'],
  ['zappi-2.png', 'Charge Your EV for FREE Using Solar Panels — Zappi Review', 'The myenergi Zappi v2 can use 100% solar energy to charge your car. Here\'s exactly how it works and whether it\'s worth the investment. Logistryx. #FreeEVCharging #SolarEV #ZappiReview #SolarPanels', 'Solar & EV Charging', 'https://logistryx.com/reviews/zappi-v2-review/'],
  ['zappi-3.png', 'myenergi Zappi — Solar Eco Mode Explained for UK Homeowners', 'Eco mode, Eco+ mode, solar divert — the Zappi v2\'s three charging modes explained simply. Is it right for your home? Find out on Logistryx. #Zappi #SolarCharger #EcoMode #EVCharging', 'Smart Home & EV Tech', 'https://logistryx.com/reviews/zappi-v2-review/'],

  // ── EASEE ──
  ['easee-1.png', 'Easee One Review 2026 — Stunning Design, But How\'s the App? (4.3/5)', 'Scandinavian minimalism meets smart charging. We rate the Easee One 4.3/5 — gorgeous hardware but smart tariff integration lags behind. Honest UK review on Logistryx. #EaseeOne #EVCharger #SmartCharger #UKEVCharger', 'EV Charger Reviews UK', 'https://logistryx.com/reviews/easee-one-review/'],
  ['easee-2.png', 'Easee One — Best EV Charger for Flats & Apartment Buildings?', 'Multi-charger load balancing makes the Easee One ideal for apartments and shared buildings. Find out why in our full UK review. Logistryx. #Easee #FlatCharging #ApartmentEV #EVChargerUK', 'EV Charger Reviews UK', 'https://logistryx.com/reviews/easee-one-review/'],
  ['easee-3.png', 'Is the Easee One Worth £849? Our Honest UK Review', 'Beautiful hardware, powerful features — but no smart tariff integration. We rate it 4.3/5. Is it right for you? Logistryx. #EaseeReview #PremiumCharger #EVChargingUK #HomeCharger', 'Best EV Chargers UK 2026', 'https://logistryx.com/reviews/easee-one-review/'],

  // ── HYPERVOLT ──
  ['hypervolt-1.png', 'Hypervolt Home 3 Pro Review 2026 — UK\'s Best All-Rounder? (4.6/5)', 'Award-winning smart charger with Octopus Intelligent Go integration and solar compatibility. Rated 4.6/5 in our tests. Full review on Logistryx. #Hypervolt #EVCharger #SmartCharging #OctopusGo', 'EV Charger Reviews UK', 'https://logistryx.com/reviews/hypervolt-home-3-review/'],
  ['hypervolt-2.png', 'Why the Hypervolt Home 3 Pro Keeps Winning Awards', 'Excellent app, solar compatibility, Octopus integration — the Hypervolt ticks nearly every box. Find out if it\'s the right charger for your home. Logistryx. #HypervoltReview #BestEVCharger #UKEVCharger', 'Best EV Chargers UK 2026', 'https://logistryx.com/reviews/hypervolt-home-3-review/'],
  ['hypervolt-3.png', 'Hypervolt Home 3 Pro — Full UK Review & Rating 2026', 'Solar, smart tariffs, and a standout app. One of our top UK charger picks this year. Full details at Logistryx. #Hypervolt #EVChargerUK #SmartHome #SolarCharging', 'Smart Home & EV Tech', 'https://logistryx.com/reviews/hypervolt-home-3-review/'],

  // ── SIMPSON & PARTNERS ──
  ['simpson-1.png', 'Simpson & Partners Home Series V3 Review — Premium UK EV Charger', 'Beautiful design, 10-year warranty, and Auto Express recommended. Is the premium price worth it? Our full UK review on Logistryx. #SimpsonPartners #PremiumCharger #EVChargerUK', 'EV Charger Reviews UK', 'https://logistryx.com/reviews/simpson-partners-review/'],
  ['simpson-2.png', 'Most Reliable EV Charger UK 2026 — Simpson & Partners V3', '10-year warranty, premium build quality, and outstanding customer support. Find out if it\'s worth the investment in our full review. Logistryx. #Reliability #PremiumEV #UKCharger', 'Best EV Chargers UK 2026', 'https://logistryx.com/reviews/simpson-partners-review/'],
  ['simpson-3.png', 'Simpson & Partners V3 — The Premium EV Charger for Quality-Focused Buyers', 'If longevity and build quality matter more than price, the V3 is worth a serious look. Our honest UK review. Logistryx. #SimpsonAndPartners #PremiumCharger #EVCharger', 'Smart Home & EV Tech', 'https://logistryx.com/reviews/simpson-partners-review/'],

  // ── ROLEC ──
  ['rolec-1.png', 'Rolec WallPod Review — Best Budget EV Charger UK 2026', 'Not every charger needs smart features. The Rolec WallPod keeps it simple and affordable. Our full budget EV charger review on Logistryx. #Rolec #BudgetCharger #CheapEVCharger #UKEVCharger', 'Money-Saving EV Tips', 'https://logistryx.com/reviews/rolec-wallpod-review/'],
  ['rolec-2.png', 'Rolec WallPod — Reliable & Affordable Home EV Charging UK', 'Basic but dependable — the go-to budget pick for UK homeowners who just want reliable charging. Rated on Logistryx. #RolecWallPod #BudgetEV #AffordableCharger #HomeCharging', 'Best EV Chargers UK 2026', 'https://logistryx.com/reviews/rolec-wallpod-review/'],
  ['rolec-3.png', 'Do You Actually Need a Smart EV Charger? The Rolec WallPod Says No', 'The Rolec WallPod proves basic charging can be great value. Perfect if you just want to charge without the fuss. Logistryx. #SimpleCharging #BudgetEVCharger #Rolec', 'EV Charging Guides & Tips', 'https://logistryx.com/reviews/rolec-wallpod-review/'],

  // ── COMPARISONS ──
  ['ohme-vs-podpoint-1.png', 'Ohme Home Pro vs Pod Point Solo 3 — Which UK Charger Should You Buy?', 'The UK\'s two most popular home EV chargers go head-to-head. We compare price, smart features, app quality, and real-world performance. Find out which wins for your home on Logistryx. #OhmeVsPodPoint #EVChargerComparison #BestEVCharger #UKHomeCharger', 'EV Charger Comparisons', 'https://logistryx.com/reviews/ohme-vs-pod-point/'],
  ['ohme-vs-podpoint-2.png', 'Smart Tariff vs Best Value — Ohme Home Pro vs Pod Point Solo 3', 'Ohme for smart tariff integration, Pod Point for simplicity and value. Our detailed comparison tells you exactly which to buy. Logistryx. #SmartCharger #EVComparison #OhmeVsPodPoint', 'EV Charger Comparisons', 'https://logistryx.com/reviews/ohme-vs-pod-point/'],
  ['ohme-vs-podpoint-3.png', 'Ohme or Pod Point? The Definitive UK EV Charger Comparison 2026', 'We pick a clear winner for different buyer types — smart tariff user, budget buyer, and everyone in between. Full comparison on Logistryx. #EVCharger #UKComparison #OhmePodPoint', 'Best EV Chargers UK 2026', 'https://logistryx.com/reviews/ohme-vs-pod-point/'],

  ['ohme-vs-easee-1.png', 'Ohme Home Pro vs Easee One 2026 — Which Smart Charger Wins?', 'Smart tariffs vs Scandinavian design. We compare both premium chargers across 12 categories. Which is right for you? Logistryx. #OhmeVsEasee #SmartCharger #EVComparison #UKEVCharger', 'EV Charger Comparisons', 'https://logistryx.com/reviews/ohme-vs-easee/'],
  ['ohme-vs-easee-2.png', 'Which Premium EV Charger Saves More Money — Ohme or Easee?', 'Ohme wins for tariff integration, Easee wins for flats and design. Find out which suits your home in our full comparison. Logistryx. #OhmeEasee #EVChargerComparison #SmartCharging', 'Money-Saving EV Tips', 'https://logistryx.com/reviews/ohme-vs-easee/'],
  ['ohme-vs-easee-3.png', 'Ohme vs Easee — The Premium Smart Charger Showdown UK 2026', 'Two of the UK\'s best smart chargers compared in detail. Price, features, app, solar, and installation. Clear verdict inside. Logistryx. #OhmeVsEasee #PremiumCharger #EVUKComparison', 'EV Charger Comparisons', 'https://logistryx.com/reviews/ohme-vs-easee/'],

  ['zappi-vs-ohme-1.png', 'Zappi vs Ohme Home Pro — Solar vs Smart Tariffs Compared', 'Which is better for solar panel owners? We break down every difference between the Zappi and Ohme Home Pro. Logistryx. #ZappiVsOhme #SolarEV #EVChargerComparison #SolarPanelsUK', 'Solar & EV Charging', 'https://logistryx.com/reviews/zappi-vs-ohme/'],
  ['zappi-vs-ohme-2.png', 'Best EV Charger for Solar Panels UK — Zappi or Ohme?', 'Zappi divert mode vs Ohme solar priority — which saves more money for solar panel owners? Our detailed UK comparison. Logistryx. #SolarCharging #BestSolarCharger #ZappiOhme', 'Solar & EV Charging', 'https://logistryx.com/reviews/zappi-vs-ohme/'],
  ['zappi-vs-ohme-3.png', 'Should Solar Owners Buy the Zappi or Ohme Home Pro?', 'The definitive comparison for UK homeowners with solar PV. We pick a winner for different use cases. Logistryx. #ZappiVsOhme #SolarPVUK #EVCharger #GreenCharging', 'EV Charger Comparisons', 'https://logistryx.com/reviews/zappi-vs-ohme/'],

  ['wallbox-vs-podpoint-1.png', 'Wallbox Pulsar Plus vs Pod Point Solo 3 — UK Comparison 2026', 'Compact European style vs trusted UK favourite. We compare price, app, smart features, and installation. Who wins? Logistryx. #WallboxVsPodPoint #EVChargerComparison #UKEVCharger', 'EV Charger Comparisons', 'https://logistryx.com/reviews/wallbox-vs-pod-point/'],
  ['wallbox-vs-podpoint-2.png', 'Which Is Better: Wallbox or Pod Point? UK Buyers Guide', 'Two solid chargers, very different strengths. Find out which suits your home in our full comparison. Logistryx. #WallboxPulsar #PodPointSolo3 #EVComparison', 'EV Charger Comparisons', 'https://logistryx.com/reviews/wallbox-vs-pod-point/'],
  ['wallbox-vs-podpoint-3.png', 'Wallbox Pulsar Plus vs Pod Point — Which Should You Buy in 2026?', 'Detailed head-to-head covering app, smart features, OZEV eligibility, and value for money. Find out on Logistryx. #EVCharger #WallboxVsPodPoint #UKComparison', 'Best EV Chargers UK 2026', 'https://logistryx.com/reviews/wallbox-vs-pod-point/'],

  ['easee-vs-hypervolt-1.png', 'Easee One vs Hypervolt Home 3 Pro — Smart Charger Showdown 2026', 'Two premium smart chargers fight it out — apps, solar, tariffs, and design compared. Which wins? Full comparison on Logistryx. #EaseeVsHypervolt #SmartCharger #EVChargerComparison', 'EV Charger Comparisons', 'https://logistryx.com/reviews/easee-vs-hypervolt/'],
  ['easee-vs-hypervolt-2.png', 'Easee or Hypervolt? Which Premium UK EV Charger Is Worth Your Money?', 'We put both through their paces and pick a winner for most UK homeowners. Read the full comparison on Logistryx. #EaseeHypervolt #BestPremiumCharger #EVChargerUK', 'EV Charger Comparisons', 'https://logistryx.com/reviews/easee-vs-hypervolt/'],
  ['easee-vs-hypervolt-3.png', 'Hypervolt vs Easee One — App, Solar & Smart Tariff Comparison UK', 'Easee for load balancing and design, Hypervolt for Octopus integration and the best app. Our verdict. Logistryx. #EVComparison #SmartCharging #EaseeVsHypervolt', 'Smart Home & EV Tech', 'https://logistryx.com/reviews/easee-vs-hypervolt/'],

  ['zappi-vs-wallbox-1.png', 'Zappi vs Wallbox Pulsar Plus 2026 — Which Should You Buy?', 'Solar divert vs compact smart charging — two completely different philosophies. Which is right for your home? Logistryx. #ZappiVsWallbox #EVChargerComparison #SolarCharging', 'EV Charger Comparisons', 'https://logistryx.com/reviews/zappi-vs-wallbox/'],
  ['zappi-vs-wallbox-2.png', 'Solar-First or Smart Tariff Charging? Zappi vs Wallbox Pulsar Plus', 'Zappi for solar maximisers, Wallbox for compact smart charging. Our 2026 comparison helps you choose. Logistryx. #SolarEVCharger #ZappiWallbox #UKEVCharger', 'Solar & EV Charging', 'https://logistryx.com/reviews/zappi-vs-wallbox/'],
  ['zappi-vs-wallbox-3.png', 'Zappi or Wallbox — The Definitive 2026 UK Comparison', 'Detailed comparison on price, solar integration, app, and smart tariff support. Full verdict on Logistryx. #ZappiVsWallbox #EVCharger #SolarCharging #UKComparison', 'EV Charger Comparisons', 'https://logistryx.com/reviews/zappi-vs-wallbox/'],

  // ── BUYER GUIDES ──
  ['best-overall-1.png', 'Best Home EV Chargers UK 2026 — Our Top 7 Picks Ranked', 'Our top 7 home EV chargers tested and ranked across every budget. From £500 to £1,500+ — find the right one for your home. Full guide on Logistryx. #BestEVCharger #HomeEVCharger #UKEVCharger #ElectricCar', 'Best EV Chargers UK 2026', 'https://logistryx.com/best-picks/best-home-ev-chargers-uk/'],
  ['best-overall-2.png', 'Which EV Charger Should You Buy in 2026? Expert UK Guide', 'We\'ve tested every major UK home charger and ranked them. Our expert buyer\'s guide helps you find the perfect match. Logistryx. #BuyersGuide #EVCharger #UKHomeCharger #ElectricVehicle', 'Best EV Chargers UK 2026', 'https://logistryx.com/best-picks/best-home-ev-chargers-uk/'],
  ['best-overall-3.png', 'Top 7 UK Home EV Chargers Ranked for 2026', 'Budget to premium — every charger you need to know about. Updated for 2026 with the latest prices and features. Logistryx. #EVChargerRanking #BestEV #UKCharger #HomeCharging', 'Best EV Chargers UK 2026', 'https://logistryx.com/best-picks/best-home-ev-chargers-uk/'],

  ['tesla-1.png', 'Best EV Charger for Tesla Owners in the UK (2026 Guide)', 'Tesla Wall Connector vs Ohme vs Zappi — which is best for your Tesla in 2026? Our expert guide covers compatibility, smart features, and value. Logistryx. #TeslaCharger #TeslaUK #HomeChargingTesla #EVCharger', 'Best EV Chargers UK 2026', 'https://logistryx.com/best-picks/best-ev-charger-tesla-uk/'],
  ['tesla-2.png', 'Should Tesla Owners Use a Third-Party Charger? UK Guide 2026', 'We compare the Tesla Wall Connector against the UK\'s best alternatives — Ohme, Zappi, Hypervolt, and more. Logistryx. #TeslaWallConnector #ThirdPartyCharger #TeslaModel3 #UKEVCharger', 'Best EV Chargers UK 2026', 'https://logistryx.com/best-picks/best-ev-charger-tesla-uk/'],
  ['tesla-3.png', 'Save Money Charging Your Tesla at Home — Best Chargers 2026', 'The best chargers for Intelligent Octopus Go and smart tariff savings with your Tesla. Full guide on Logistryx. #TeslaCharging #OctopusGo #TeslaSavings #SmartCharging', 'Money-Saving EV Tips', 'https://logistryx.com/best-picks/best-ev-charger-tesla-uk/'],

  ['flats-1.png', 'Can You Get an EV Charger in a Flat? UK Guide 2026', 'Leaseholder rights, OZEV grants, and the best chargers for apartments. Yes — flat dwellers CAN charge at home. Full guide on Logistryx. #FlatCharging #ApartmentEV #LeaseholderRights #OZEVGrant', 'EV Charger Installation UK', 'https://logistryx.com/best-picks/best-ev-charger-flats-uk/'],
  ['flats-2.png', 'Best EV Charger for Flats & Apartments UK 2026', 'Here\'s exactly how to get home EV charging if you live in a flat or apartment. Including the OZEV grant for renters. Logistryx. #FlatEVCharger #ApartmentCharging #EVChargingUK #Leaseholder', 'EV Charger Installation UK', 'https://logistryx.com/best-picks/best-ev-charger-flats-uk/'],
  ['flats-3.png', 'EV Charging for Renters & Leaseholders UK — Your Complete Guide', 'Your rights, the OZEV grant, and how to convince your building management. Everything you need to know. Logistryx. #EVRenter #LeaseholderEV #ApartmentCharging #OZEVGrant', 'Money-Saving EV Tips', 'https://logistryx.com/best-picks/best-ev-charger-flats-uk/'],

  ['tariff-1.png', 'Best EV Charger for Octopus Intelligent Go & Smart Tariffs 2026', 'Which chargers unlock Octopus Intelligent Go\'s cheapest night rates? Our complete guide to smart tariff compatible chargers. Logistryx. #OctopusGo #IntelligentOctopus #SmartCharging #EVTariff', 'Money-Saving EV Tips', 'https://logistryx.com/best-picks/best-ev-charger-smart-tariff/'],
  ['tariff-2.png', 'Charge Your EV for 3.5p Per kWh — Best Smart Chargers UK 2026', 'The chargers that unlock Octopus Intelligent Go\'s rock-bottom overnight rates. Are you missing out? Logistryx. #CheapEVCharging #OctopusEnergy #SmartTariff #EVSavings', 'Money-Saving EV Tips', 'https://logistryx.com/best-picks/best-ev-charger-smart-tariff/'],
  ['tariff-3.png', 'Smart Tariff Compatible EV Chargers UK — Full Guide 2026', 'Not every charger unlocks cheap electricity rates. Here\'s exactly which ones do — and how much you can save. Logistryx. #SmartCharger #EVTariff #CheapCharging #OctopusGo', 'Smart Home & EV Tech', 'https://logistryx.com/best-picks/best-ev-charger-smart-tariff/'],

  ['budget-1.png', 'Best Budget EV Charger UK 2026 — Ohme ePod vs Rolec vs EO Mini Pro', 'Don\'t want to spend a fortune? We compare the best cheap UK home EV chargers including total installed costs. Logistryx. #BudgetEVCharger #CheapEVCharger #AffordableCharger #UKHomeCharger', 'Money-Saving EV Tips', 'https://logistryx.com/best-picks/best-budget-ev-charger-uk/'],
  ['budget-2.png', 'Do You Need to Spend Over £700 on a Home EV Charger?', 'Honest guide to budget EV chargers — what you get, what you sacrifice, and whether it\'s worth upgrading. Logistryx. #BudgetCharger #EVSavings #AffordableEV #HomeCharging', 'Money-Saving EV Tips', 'https://logistryx.com/best-picks/best-budget-ev-charger-uk/'],
  ['budget-3.png', 'Best Cheap EV Chargers UK 2026 — Three-Way Budget Comparison', 'Including the OZEV grant, which makes budget chargers even cheaper. Full comparison on Logistryx. #CheapEVCharger #BudgetEV #OZEVGrant #UKEVCharger', 'Best EV Chargers UK 2026', 'https://logistryx.com/best-picks/best-budget-ev-charger-uk/'],

  ['3phase-1.png', '22kW Home EV Charging — Is 3-Phase Worth It in the UK?', 'Who actually has 3-phase power at home, and is it worth the £3,500-£15,000 upgrade cost? Honest guide on Logistryx. #3PhaseCharging #22kW #EVChargerUK #HomeCharging', 'EV Charger Installation UK', 'https://logistryx.com/best-picks/best-3-phase-ev-charger-uk/'],
  ['3phase-2.png', 'Best 3-Phase EV Charger UK 2026 — Zappi, Easee & Wallbox Compared', 'Which chargers support 22kW AC charging in the UK? And which cars can actually use it? Full guide on Logistryx. #3PhaseEV #22kWCharger #ThreePhaseUK #EVCharger', 'EV Charger Installation UK', 'https://logistryx.com/best-picks/best-3-phase-ev-charger-uk/'],
  ['3phase-3.png', '3-Phase vs Single-Phase EV Charging Explained for UK Homeowners', 'Is upgrading your electricity supply worth the cost? We crunch the numbers for UK homes. Logistryx. #3PhaseCharging #EVInstallation #HomeEVCharger #ElectricCar', 'EV Charging Guides & Tips', 'https://logistryx.com/best-picks/best-3-phase-ev-charger-uk/'],

  ['bycar-1.png', 'Best EV Charger for VW, BMW & Hyundai Owners UK 2026', 'Car-specific recommendations for VW ID.3, BMW i4, Hyundai Ioniq 5, MG4, Kia EV6, and Nissan Leaf. Logistryx. #VWCharger #BMWCharger #HyundaiCharger #EVChargerUK', 'Best EV Chargers UK 2026', 'https://logistryx.com/best-picks/best-ev-charger-by-car/'],
  ['bycar-2.png', 'Best Home Charger for VW ID.3, BMW i4 & Hyundai Ioniq 5', 'Each car has different onboard charger limits — get the right charger for yours. Full guide on Logistryx. #VWId3Charger #BMWi4 #IoniqCharger #HomeEVCharger', 'Best EV Chargers UK 2026', 'https://logistryx.com/best-picks/best-ev-charger-by-car/'],
  ['bycar-3.png', 'Which EV Charger Works Best With Your Electric Car? UK Guide', 'MG4, Kia EV6, Nissan Leaf, VW, BMW, Hyundai — we cover them all in one guide. Logistryx. #EVChargerByModel #UKElectricCar #HomeCharging #EVUKGuide', 'EV Charging Guides & Tips', 'https://logistryx.com/best-picks/best-ev-charger-by-car/'],

  // ── GUIDES ──
  ['installation-1.png', 'How Much Does EV Charger Installation Cost in the UK? (2026)', 'Real costs, what affects the price, and how to avoid overpaying. From £500 to £1,500+ — here\'s what to expect. Logistryx. #EVInstallationCost #EVChargerCost #HomeChargingUK #InstallationGuide', 'EV Charger Installation UK', 'https://logistryx.com/guides/home-ev-charger-installation-uk/'],
  ['installation-2.png', 'EV Charger Installation UK — Real Prices for 2026', 'What determines your installation cost? Cable run length, consumer unit upgrades, and more. Full breakdown on Logistryx. #EVInstallation #ChargerInstallation #UKHomeEV #ElectricCarCost', 'EV Charger Installation UK', 'https://logistryx.com/guides/home-ev-charger-installation-uk/'],
  ['installation-3.png', 'Don\'t Get Ripped Off on EV Charger Installation — UK Guide', 'What to look for in an installer, red flags to avoid, and fair prices to expect. Protect yourself with Logistryx. #EVInstaller #ChargerInstallation #HomeEVCost #UKEVGuide', 'EV Charger Installation UK', 'https://logistryx.com/guides/home-ev-charger-installation-uk/'],

  ['ozev-1.png', 'Get £350 Off Your EV Charger — The OZEV Government Grant Explained', 'Most UK homeowners qualify for the OZEV Electric Vehicle Chargepoint Grant. Here\'s how to claim it step by step. Logistryx. #OZEVGrant #EVGrant #FreeMoneyEV #GovernmentGrant', 'Money-Saving EV Tips', 'https://logistryx.com/guides/ev-charger-government-grant-uk/'],
  ['ozev-2.png', 'Free Money for Your EV Charger — OZEV Grant 2026', 'Up to £350 off your home EV charger installation. Step-by-step guide to claiming the grant on Logistryx. #OZEVGrant2026 #EVGrantUK #CheapEVInstallation #GovernmentScheme', 'Money-Saving EV Tips', 'https://logistryx.com/guides/ev-charger-government-grant-uk/'],
  ['ozev-3.png', 'Do You Qualify for the UK OZEV EV Charger Grant?', 'Check eligibility, choose an approved installer, and save up to £350 on installation. Full guide on Logistryx. #EVGrant #OZEVEligibility #HomeEVCharger #UKGrant', 'EV Charger Installation UK', 'https://logistryx.com/guides/ev-charger-government-grant-uk/'],

  ['level-1.png', 'Level 1 vs Level 2 EV Charger — Plain English UK Guide', '3-pin vs 7kW wall charger explained simply for UK homeowners. Which do you actually need? Full guide on Logistryx. #Level1vsLevel2 #EVChargerTypes #HomeCharging #EVGuide', 'EV Charging Guides & Tips', 'https://logistryx.com/guides/level-1-vs-level-2-ev-charger/'],
  ['level-2.png', 'Why a 3-Pin Charger Is 8x Slower Than a Wall Charger', '3-pin charging vs a proper 7kW wall charger — the difference is huge. Find out why on Logistryx. #SlowCharging #EVWallCharger #Level2Charging #HomeEVCharger', 'EV Charging Guides & Tips', 'https://logistryx.com/guides/level-1-vs-level-2-ev-charger/'],
  ['level-3.png', '7kW vs 3-Pin EV Charging — Everything UK Homeowners Need to Know', 'Speed, safety, cost, and convenience compared. Make the right choice for your home on Logistryx. #7kWCharger #3PinCharging #EVChargerUK #HomeChargingGuide', 'EV Charging Guides & Tips', 'https://logistryx.com/guides/level-1-vs-level-2-ev-charger/'],

  ['smart-1.png', 'What Is a Smart EV Charger? UK Guide 2026', 'We cut through the jargon — here\'s what smart chargers actually do and whether you need one. Logistryx. #SmartEVCharger #WhatIsSmartCharger #HomeCharging #EVTech', 'Smart Home & EV Tech', 'https://logistryx.com/guides/smart-ev-charger-explained/'],
  ['smart-2.png', 'Smart EV Chargers — Are They Worth the Extra Cost?', 'Schedule charging, track energy use, and slash your electricity bill. The case for smart chargers explained. Logistryx. #SmartCharger #EVSavings #SmartHome #EVCharging', 'Smart Home & EV Tech', 'https://logistryx.com/guides/smart-ev-charger-explained/'],
  ['smart-3.png', 'Smart vs Basic EV Charger — Which Should UK Homeowners Buy?', 'The honest comparison — when a smart charger pays for itself and when it doesn\'t. Logistryx. #SmartVsBasic #EVChargerGuide #HomeCharging #UKEVGuide', 'EV Charging Guides & Tips', 'https://logistryx.com/guides/smart-ev-charger-explained/'],

  ['solar-1.png', 'Charge Your EV for FREE Using Solar Panels — UK Guide 2026', 'How to pair home solar panels with your EV charger and cut running costs to near zero. Logistryx. #SolarEVCharging #FreeCharging #SolarPanelsUK #EVSolar', 'Solar & EV Charging', 'https://logistryx.com/guides/ev-charger-solar-panels-uk/'],
  ['solar-2.png', 'Solar Panels + EV Charger — The Complete UK Homeowner\'s Guide', 'Which chargers work best with solar PV? How much can you actually save? Full guide on Logistryx. #SolarEV #EVSolarUK #SolarPanels #ZappiSolar', 'Solar & EV Charging', 'https://logistryx.com/guides/ev-charger-solar-panels-uk/'],
  ['solar-3.png', 'Best EV Charger for Solar Panel Owners UK 2026', 'Zappi, Ohme, or Hypervolt? The solar-compatible chargers compared for UK homeowners. Logistryx. #SolarCharger #EVSolar #BestSolarCharger #SolarPanelsUK', 'Solar & EV Charging', 'https://logistryx.com/guides/ev-charger-solar-panels-uk/'],

  ['cost-1.png', 'How Much Does It Cost to Charge an EV at Home in 2026? UK Guide', 'Per kWh rates, cost per mile for 10 popular EVs, and how smart tariffs can slash your bill. Updated for April 2026. Logistryx. #EVChargingCost #CostPerMile #HomeChargingUK #ElectricCarCost', 'Money-Saving EV Tips', 'https://logistryx.com/guides/ev-charging-cost-uk-2026/'],
  ['cost-2.png', 'EV vs Petrol — The Real Running Cost Comparison UK 2026', 'We crunch the numbers: home charging vs petrol, smart tariff savings, and cost per mile. Logistryx. #EVvsPetrol #RunningCosts #EVSavings #ElectricCarCost', 'Money-Saving EV Tips', 'https://logistryx.com/guides/ev-charging-cost-uk-2026/'],
  ['cost-3.png', 'EV Charging Costs 2026 — Updated for April Price Cap Changes', 'April 2026 electricity prices, Octopus rate changes, and cost per mile for 10 popular electric cars. Logistryx. #EVCost2026 #ElectricityCosts #EVCharging #SmartTariff', 'EV Charging Guides & Tips', 'https://logistryx.com/guides/ev-charging-cost-uk-2026/'],

  ['tariff-guide-1.png', 'Best EV Energy Tariff UK 2026 — Octopus vs OVO vs British Gas', 'Octopus Go, Intelligent Octopus, OVO Charge Anytime — the cheapest rates for home EV charging compared. Logistryx. #EVTariff #BestEVTariff #OctopusGo #CheapEVCharging', 'Money-Saving EV Tips', 'https://logistryx.com/guides/best-ev-tariff-uk-2026/'],
  ['tariff-guide-2.png', 'Get EV Electricity for 3.5p Per kWh — Best UK Tariffs 2026', 'The best smart tariffs for UK EV drivers ranked and compared. Save hundreds per year. Full guide on Logistryx. #CheapEVElectricity #OctopusIntelligent #EVTariffUK #EVSavings', 'Money-Saving EV Tips', 'https://logistryx.com/guides/best-ev-tariff-uk-2026/'],
  ['tariff-guide-3.png', 'Which EV Energy Tariff Saves the Most Money in the UK?', 'Off-peak rates, standing charges, and charger compatibility — all compared in one guide. Logistryx. #EVEnergyTariff #UKEVTariff #OctopusGo #CheapCharging', 'Smart Home & EV Tech', 'https://logistryx.com/guides/best-ev-tariff-uk-2026/'],

  ['time-1.png', 'How Long Does It Take to Charge an EV at Home UK? 2026 Guide', 'Charging times for Tesla, VW, Hyundai, MG and more at 3-pin, 7kW, and 22kW. Full guide on Logistryx. #EVChargingTime #HowLongToCharge #HomeChargingUK #EVGuide', 'EV Charging Guides & Tips', 'https://logistryx.com/guides/ev-charging-time-guide/'],
  ['time-2.png', 'Why Your EV Doesn\'t Charge at Full 7kW Speed — Explained', 'Onboard charger limits mean many EVs can\'t use 7kW. Find out your car\'s actual max speed. Logistryx. #OnboardCharger #EVChargingSpeed #HomeEVCharger #EVFacts', 'EV Charging Guides & Tips', 'https://logistryx.com/guides/ev-charging-time-guide/'],
  ['time-3.png', 'EV Charging Time Table UK 2026 — 12 Popular Electric Cars Compared', 'How long to charge a Tesla, VW ID.3, Hyundai Ioniq 5, MG4 and more from 20% to 80% at home. Logistryx. #EVChargingTimes #ChargingTimeTable #ElectricCarUK', 'EV Charging Guides & Tips', 'https://logistryx.com/guides/ev-charging-time-guide/'],

  ['planning-1.png', 'Do You Need Planning Permission for a Home EV Charger in the UK?', 'Permitted development rights, conservation areas, listed buildings — when you do and don\'t need permission. Logistryx. #PlanningPermission #EVChargerUK #PermittedDevelopment #HomeImprovement', 'EV Charger Installation UK', 'https://logistryx.com/guides/ev-charger-planning-permission-uk/'],
  ['planning-2.png', 'EV Charger Planning Permission UK — The Complete Guide 2026', 'Listed buildings, conservation areas, and flats — when you need planning approval. Scotland rules included. Logistryx. #PlanningPermissionUK #EVInstallation #ListedBuilding #ConservationArea', 'EV Charger Installation UK', 'https://logistryx.com/guides/ev-charger-planning-permission-uk/'],
  ['planning-3.png', 'Most EV Chargers Don\'t Need Planning Permission — Here\'s When They Do', 'Plain-English guide to EV charger planning rules in England, Scotland, and Wales. Logistryx. #PermittedDevelopment #EVCharger #PlanningRules #HomeEVCharger', 'EV Charger Installation UK', 'https://logistryx.com/guides/ev-charger-planning-permission-uk/'],

  ['loadbal-1.png', 'What Is EV Charger Load Balancing? UK Guide Explained Simply', 'CT clamps, dynamic balancing, and why your fuse box matters — explained in plain English. Logistryx. #LoadBalancing #EVCharger #CTClamp #HomeCharging', 'Smart Home & EV Tech', 'https://logistryx.com/guides/ev-charger-load-balancing/'],
  ['loadbal-2.png', 'Stop Your EV Charger Tripping the Fuse Box — Load Balancing Explained', 'Load balancing prevents overloading your home\'s electrical supply. Here\'s which chargers include it. Logistryx. #FuseBox #LoadBalancing #EVInstallation #HomeElectrics', 'EV Charger Installation UK', 'https://logistryx.com/guides/ev-charger-load-balancing/'],
  ['loadbal-3.png', 'Dynamic Load Balancing for EV Chargers — Do You Need It UK?', 'For most homes, yes. Here\'s why and which chargers support it in the UK. Logistryx. #DynamicLoadBalancing #EVChargerUK #SmartCharging #HomeElectrics', 'Smart Home & EV Tech', 'https://logistryx.com/guides/ev-charger-load-balancing/'],

  ['v2g-1.png', 'Vehicle-to-Grid UK 2026 — Power Your Home From Your EV Battery', 'V2G is coming to the UK — here\'s what it means for EV owners, which cars support it, and when to expect it. Logistryx. #V2G #VehicleToGrid #BidirectionalCharging #EVTech', 'Smart Home & EV Tech', 'https://logistryx.com/guides/v2g-vehicle-to-grid-uk/'],
  ['v2g-2.png', 'Can Your Electric Car Power Your Home During a Blackout?', 'V2H and V2G explained — which cars and chargers support bidirectional charging in the UK. Logistryx. #V2H #VehicleToHome #EVBattery #BiDirectionalEV', 'Smart Home & EV Tech', 'https://logistryx.com/guides/v2g-vehicle-to-grid-uk/'],
  ['v2g-3.png', 'V2G UK 2026 — Is It Worth Waiting For? Honest Assessment', 'Not mainstream yet, but coming fast. Our honest take on vehicle-to-grid technology and when it goes mainstream. Logistryx. #V2GUK #FutureEV #BidirectionalCharging #EVFuture', 'Smart Home & EV Tech', 'https://logistryx.com/guides/v2g-vehicle-to-grid-uk/'],

  ['market-1.png', 'UK EV Charger Market 2026 — What\'s Changed This Year?', 'New brands, smart tariff evolution, OZEV changes, and 6 predictions for what\'s coming next. Logistryx. #EVMarket2026 #EVChargerUK #ElectricVehicle #EVTrends', 'Smart Home & EV Tech', 'https://logistryx.com/guides/uk-ev-charger-market-2026/'],
  ['market-2.png', 'The Future of Home EV Charging in the UK — 6 Predictions', 'V2G, solar integration, smart tariffs, and Chinese brands entering the UK market. What\'s next? Logistryx. #EVFuture #EVCharger2026 #EVTrends #UKElectricCar', 'Smart Home & EV Tech', 'https://logistryx.com/guides/uk-ev-charger-market-2026/'],
  ['market-3.png', 'Which EV Charger Brands Are Winning in the UK in 2026?', 'Ohme, Hypervolt, Easee, Zappi — the market rankings and what\'s shifting. Logistryx. #EVBrands #EVChargerRanking #UKEVMarket #BestEVBrands', 'Best EV Chargers UK 2026', 'https://logistryx.com/guides/uk-ev-charger-market-2026/'],

  ['workplace-1.png', 'Free Money for Business EV Chargers — WCS Grant UK 2026', 'UK small businesses can claim £500 per socket under the Workplace Charging Scheme. Here\'s how to apply. Logistryx. #WorkplaceCharging #WCSGrant #BusinessEV #UKGrant', 'EV Charger Installation UK', 'https://logistryx.com/guides/workplace-ev-charging-uk/'],
  ['workplace-2.png', 'Workplace EV Charging UK — The Complete Business Guide 2026', 'Tax benefits, WCS grants, and the best chargers for UK small businesses. Everything you need to know. Logistryx. #WorkplaceEV #BusinessCharging #EVTaxBenefits #UKBusiness', 'EV Charger Installation UK', 'https://logistryx.com/guides/workplace-ev-charging-uk/'],
  ['workplace-3.png', 'Should Your UK Business Install EV Chargers in 2026?', 'Employee benefits, capital allowances, BIK rates, and the WCS grant — the business case explained. Logistryx. #BusinessEVCharger #WorkplaceCharging #CompanyCarEV #UKBusiness', 'Smart Home & EV Tech', 'https://logistryx.com/guides/workplace-ev-charging-uk/'],
];

async function createBoard(page, name) {
  console.log(`Creating board: ${name}`);
  await page.goto('https://uk.pinterest.com/Logistryx/', { waitUntil: 'domcontentloaded' });
  await DELAY(2000);

  // Click Create button
  const createBtn = await page.$('[data-test-id="header-create-button"], button[aria-label*="Create"], button');
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.trim() === 'Create') {
      await btn.click();
      break;
    }
  }
  await DELAY(1000);

  // Click Board from menu
  const menuItems = await page.$$('[role="menuitem"]');
  for (const item of menuItems) {
    const text = await page.evaluate(el => el.textContent, item);
    if (text && text.includes('Board')) {
      await item.click();
      break;
    }
  }
  await DELAY(1500);

  // Type board name
  const nameInput = await page.$('input[placeholder*="Places"], input[placeholder*="name"], input[name="boardName"]');
  if (nameInput) {
    await nameInput.type(name, { delay: 30 });
    await DELAY(500);
    // Click Create
    const dialogBtns = await page.$$('button');
    for (const btn of dialogBtns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.trim() === 'Create' && !(await page.evaluate(el => el.disabled, btn))) {
        await btn.click();
        break;
      }
    }
    await DELAY(2000);
    console.log(`✅ Board created: ${name}`);
    return true;
  }
  console.log(`❌ Could not create board: ${name}`);
  return false;
}

async function uploadPin(page, [imgFile, title, description, board, link]) {
  const imgPath = path.join(PIN_DIR, imgFile);
  if (!fs.existsSync(imgPath)) {
    console.log(`⚠️  Skipping ${imgFile} — file not found`);
    return false;
  }

  console.log(`Uploading: ${imgFile}`);

  await page.goto('https://uk.pinterest.com/pin-builder/', { waitUntil: 'domcontentloaded' });
  await DELAY(3000);

  // Upload image
  const fileInput = await page.$('input[type="file"]');
  if (!fileInput) {
    console.log('❌ No file input found');
    return false;
  }
  await fileInput.uploadFile(imgPath);
  await DELAY(4000);

  // Title
  const titleInput = await page.$('[data-test-id="pin-draft-title"] input, input[placeholder*="title"], input[placeholder*="Add"]');
  if (titleInput) {
    await titleInput.click({ clickCount: 3 });
    await titleInput.type(title.substring(0, 100), { delay: 20 });
    await DELAY(500);
  }

  // Description
  const descInput = await page.$('[data-test-id="pin-draft-description"] textarea, textarea[placeholder*="description"], textarea[placeholder*="about"]');
  if (descInput) {
    await descInput.click();
    await descInput.type(description.substring(0, 500), { delay: 10 });
    await DELAY(500);
  }

  // Link
  const linkInput = await page.$('[data-test-id="pin-draft-link"] input, input[placeholder*="link"], input[placeholder*="url"], input[placeholder*="destination"]');
  if (linkInput) {
    await linkInput.click({ clickCount: 3 });
    await linkInput.type(link, { delay: 20 });
    await DELAY(500);
  }

  // Board selector
  const boardBtn = await page.$('[data-test-id="board-dropdown-select-button"], button[aria-label*="Choose a board"], [data-test-id="pin-draft-board"]');
  if (boardBtn) {
    await boardBtn.click();
    await DELAY(1500);

    // Search for board
    const boardSearch = await page.$('input[placeholder*="Search"], input[placeholder*="board"]');
    if (boardSearch) {
      await boardSearch.type(board.substring(0, 20), { delay: 30 });
      await DELAY(1500);
    }

    // Select board
    const boardOptions = await page.$$('[data-test-id="board-row"], [role="option"]');
    if (boardOptions.length > 0) {
      await boardOptions[0].click();
      await DELAY(1000);
    } else {
      // Escape and try direct text
      await page.keyboard.press('Escape');
    }
  }

  // Publish
  await DELAY(1000);
  const publishBtn = await page.$('[data-test-id="board-dropdown-save-button"], button[data-test-id*="publish"], button[aria-label*="Publish"]');
  if (publishBtn) {
    await publishBtn.click();
    await DELAY(3000);
    console.log(`✅ Uploaded: ${imgFile}`);
    return true;
  }

  // Fallback: find Publish button by text
  const allBtns = await page.$$('button');
  for (const btn of allBtns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && (text.trim() === 'Publish' || text.trim() === 'Save')) {
      await btn.click();
      await DELAY(3000);
      console.log(`✅ Uploaded: ${imgFile}`);
      return true;
    }
  }

  console.log(`❌ Could not publish: ${imgFile}`);
  return false;
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    args: [
      '--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu',
      '--user-data-dir=/tmp/pinterest-session',
    ],
    headless: true,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // Login
  console.log('Logging in...');
  await page.goto('https://uk.pinterest.com/login/', { waitUntil: 'domcontentloaded' });
  await DELAY(2000);

  const emailInput = await page.$('input[name="id"], input[type="email"], input[placeholder*="Email"]');
  const passInput = await page.$('input[name="password"], input[type="password"]');
  if (emailInput && passInput) {
    await emailInput.type('octagonmma2025@gmail.com', { delay: 50 });
    await passInput.type('han244Dy!#', { delay: 50 });
    await page.keyboard.press('Enter');
    await DELAY(4000);
    console.log('✅ Logged in');
  }

  // Create remaining boards (skip "Best EV Chargers UK 2026" — already created)
  const boardsToCreate = BOARDS.filter(b => b !== 'Best EV Chargers UK 2026');
  for (const board of boardsToCreate) {
    await createBoard(page, board);
    await DELAY(2000);
  }

  // Upload pins
  console.log(`\nStarting pin uploads (${PINS.length} pins)...\n`);
  let success = 0, fail = 0;
  for (let i = 0; i < PINS.length; i++) {
    const ok = await uploadPin(page, PINS[i]);
    if (ok) success++; else fail++;
    console.log(`Progress: ${i+1}/${PINS.length} (✅ ${success} ❌ ${fail})`);
    await DELAY(2000);
  }

  console.log(`\n🎉 Done! ${success} pins uploaded, ${fail} failed`);
  await browser.close();
}

main().catch(console.error);
