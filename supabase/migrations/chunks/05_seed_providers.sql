-- =====================================================
-- CHUNK 5/6: Seed Default Providers (3-Layer Hybrid System)
-- =====================================================

-- Layer 1: Web Scraping (Priority 1) - 11 Italian Carriers
INSERT INTO tracking_providers (name, type, provider, priority, free_tier_limit, cost_per_request, metadata) VALUES
('MSC Web Scraper', 'ocean', 'web_scraping', 1, NULL, 0.00, '{"carrier": "msc", "market_share": 40, "url": "https://www.msc.com/track-a-shipment", "cache_ttl": 7200}'::jsonb),
('Maersk Web Scraper', 'ocean', 'web_scraping', 1, NULL, 0.00, '{"carrier": "maersk", "market_share": 15, "url": "https://www.maersk.com/tracking", "cache_ttl": 7200}'::jsonb),
('CMA CGM Web Scraper', 'ocean', 'web_scraping', 1, NULL, 0.00, '{"carrier": "cma_cgm", "market_share": 12, "url": "https://www.cma-cgm.com/ebusiness/tracking", "cache_ttl": 7200}'::jsonb),
('COSCO Web Scraper', 'ocean', 'web_scraping', 1, NULL, 0.00, '{"carrier": "cosco", "market_share": 10, "url": "https://elines.coscoshipping.com/ebusiness/cargotracking", "cache_ttl": 7200}'::jsonb),
('Hapag-Lloyd Web Scraper', 'ocean', 'web_scraping', 1, NULL, 0.00, '{"carrier": "hapag_lloyd", "market_share": 8, "url": "https://www.hapag-lloyd.com/en/online-business/track/track-by-container.html", "cache_ttl": 7200}'::jsonb),
('ONE Web Scraper', 'ocean', 'web_scraping', 1, NULL, 0.00, '{"carrier": "one", "market_share": 6, "url": "https://ecomm.one-line.com/ecom/CUP_HOM_3301.do", "cache_ttl": 7200}'::jsonb),
('Evergreen Web Scraper', 'ocean', 'web_scraping', 1, NULL, 0.00, '{"carrier": "evergreen", "market_share": 5, "url": "https://www.shipmentlink.com/servlet/TDB1_CargoTracking.do", "cache_ttl": 7200}'::jsonb),
('Yang Ming Web Scraper', 'ocean', 'web_scraping', 1, NULL, 0.00, '{"carrier": "yang_ming", "market_share": 3, "url": "https://www.yangming.com/e-service/track_trace/track_trace_cargo_tracking.aspx", "cache_ttl": 7200}'::jsonb),
('HMM Web Scraper', 'ocean', 'web_scraping', 1, NULL, 0.00, '{"carrier": "hmm", "market_share": 3, "url": "https://www.hmm21.com/cms/business/ebiz/trackTrace/trackTrace/index.jsp", "cache_ttl": 7200}'::jsonb),
('ZIM Web Scraper', 'ocean', 'web_scraping', 1, NULL, 0.00, '{"carrier": "zim", "market_share": 2, "url": "https://www.zim.com/tools/track-a-shipment", "cache_ttl": 7200}'::jsonb),
('OOCL Web Scraper', 'ocean', 'web_scraping', 1, NULL, 0.00, '{"carrier": "oocl", "market_share": 2, "url": "https://www.oocl.com/eng/ourservices/eservices/cargotracking/Pages/cargotracking.aspx", "cache_ttl": 7200}'::jsonb)
ON CONFLICT DO NOTHING;

-- Layer 2: JSONCargo API (Priority 2) - Fallback
INSERT INTO tracking_providers (name, type, provider, priority, free_tier_limit, cost_per_request, metadata) VALUES
('JSONCargo API', 'ocean', 'jsoncargo', 2, NULL, 0.00, '{"base_url": "https://api.jsoncargo.com", "unlimited": true, "monthly_cost": 9, "coverage": 150}'::jsonb)
ON CONFLICT DO NOTHING;

-- Layer 3: ShipsGo (Priority 3) - Ultimate Fallback
INSERT INTO tracking_providers (name, type, provider, priority, free_tier_limit, cost_per_request, metadata) VALUES
('ShipsGo Ultimate Fallback', 'ocean', 'shipsgo', 3, NULL, 0.10, '{"base_url": "https://api.shipsgo.com", "coverage": 115, "ultimate_fallback": true}'::jsonb)
ON CONFLICT DO NOTHING;
