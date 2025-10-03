# Phase 6: Carrier Integrations - Comprehensive Research Report

**Date:** October 1, 2025
**Project:** SCH-PRO-NEXT Shipment Management Platform
**Phase:** 6 - Multi-Carrier API Integration

---

## Executive Summary

This report provides comprehensive research on the top 10 ocean carriers from ShipsGo's list, analyzing their API availability, authentication methods, tracking capabilities, DCSA compliance, and pricing models. Additionally, it compares alternative aggregator solutions (ShipsGo, TrackingMore, VIZION API, MarineTraffic) and provides implementation recommendations for Phase 6.

**Key Findings:**
- 6 out of 10 carriers offer official public API developer portals (Maersk, MSC, CMA CGM, Hapag-Lloyd, Evergreen, ZIM)
- 4 carriers require third-party aggregators (COSCO, ONE, Yang Ming, HMM)
- All major carriers support or are moving towards DCSA Track & Trace 2.2 standard
- Aggregator solutions are recommended for initial implementation to cover all carriers uniformly

---

## 1. Top 10 Ocean Carriers - Detailed Analysis

### Carrier API Availability Summary Table

| Carrier | Official API | DCSA Compliant | Auth Method | Rate Limits | Pricing | Recommendation |
|---------|-------------|----------------|-------------|-------------|---------|----------------|
| **Maersk Line** | Yes | Yes (T&T 2.2) | API Key | Not disclosed | Contact sales | Direct integration |
| **MSC** | Yes | Yes (T&T 2.2) | API Token | Not disclosed | Fees apply | Direct integration |
| **CMA CGM** | Yes | Yes (T&T 2.1/2.2) | API Key | Not disclosed | See portal | Direct integration |
| **COSCO** | Limited | In progress | N/A | N/A | N/A | Use aggregator |
| **Hapag-Lloyd** | Yes | Yes (T&T 2.2) | OAuth/API Key | Not disclosed | Contact sales | Direct integration |
| **ONE** | No | N/A | N/A | N/A | N/A | Use aggregator |
| **Evergreen** | Yes | Yes (T&T 2.2) | API Key | Not disclosed | Contact sales | Direct integration |
| **Yang Ming** | No | N/A | N/A | N/A | N/A | Use aggregator |
| **HMM** | No | N/A | N/A | N/A | N/A | Use aggregator |
| **ZIM** | Yes | Partial | API Token | Not disclosed | Contact sales | Direct integration |

---

### 1.1 Maersk Line

**Official API:** YES
**Developer Portal:** https://developer.maersk.com/
**Documentation:** https://delivers.maersk.com/developer/apis/tracking/

#### Capabilities
- **Authentication:** API Key / OAuth
- **Tracking Methods:**
  - Container number
  - Bill of Lading (B/L)
  - Booking reference
  - Shipment number
- **Real-time:** Yes, push-based webhooks available
- **DCSA Compliance:** YES
  - Track & Trace 2.2 ✓
  - Booking 2.0 Beta ✓
  - Operational Vessel Schedules 3.0 Beta 1 ✓
  - Bill of Lading 2.0 ✓

#### Technical Details
- **Architecture:** RESTful API with JSON data interchange
- **Rate Limits:** Not publicly disclosed (contact for details)
- **Polling Frequency:** Real-time push via webhooks
- **Data Standards:** DCSA-compliant data structure

#### Pricing
- Contact Maersk sales for pricing details
- Enterprise-focused pricing model
- No public free tier information

#### Notes
- Industry leader in digital transformation
- Most mature API offering among carriers
- Strong documentation and developer support
- Recommended for direct integration

---

### 1.2 MSC (Mediterranean Shipping Company)

**Official API:** YES
**Developer Portal:** https://developerportal.msc.com/

#### Capabilities
- **Authentication:** API Token (obtained via registration)
- **Tracking Methods:**
  - Container tracking
  - B/L tracking
  - Booking tracking
- **Real-time:** Near real-time data exchanges
- **DCSA Compliance:** YES
  - Track & Trace API designed to DCSA standards
  - Track & Trace 2.2 implemented ✓

#### Technical Details
- **Architecture:** RESTful API with secure connections
- **Rate Limits:** Not publicly disclosed
- **Polling Frequency:** Near real-time updates
- **API Types:** Track & Trace, Booking Management, EDI support

#### Pricing
- Fees may apply for onboarding
- Contact MSC team via Direct Integration Request Form
- Enterprise-level pricing

#### Notes
- Second-largest carrier by capacity
- API registration requires business validation
- Strong DCSA standards adoption
- Recommended for direct integration

---

### 1.3 CMA CGM

**Official API:** YES
**API Portal:** https://api-portal.cma-cgm.com/

#### Capabilities
- **Authentication:** API Key (via portal subscription)
- **Tracking Methods:**
  - Container tracking
  - Bill of Lading
  - Booking reference
  - Shipment tracking
- **Real-time:** Yes, event-based mechanism with subscriptions
- **DCSA Compliance:** YES
  - Implemented DCSA Track & Trace 2.1 (2021)
  - Upgraded to 2.2 later in 2021
  - eBL API conforms to DCSA standards

#### Technical Details
- **Architecture:** REST API (widely used web standard)
- **Rate Limits:** Not publicly disclosed
- **Polling Frequency:** Real-time on-demand via REST API or event subscriptions
- **Available APIs:**
  - Track & Trace
  - Booking Requests & Confirmations
  - Original B/L
  - Container Tracking
  - Schedules

#### Pricing
- Dedicated pricing page exists (api-pricing)
- Contact via portal for specific pricing details
- Enterprise-level access

#### Notes
- Early DCSA adopter
- Comprehensive API suite
- Good documentation on portal
- Recommended for direct integration

---

### 1.4 COSCO Shipping

**Official API:** LIMITED
**Official Website:** https://lines.coscoshipping.com/

#### Capabilities
- **Authentication:** N/A (no public API)
- **Tracking Methods:** Web-based only
- **Real-time:** Not available via direct API
- **DCSA Compliance:** IN PROGRESS
  - IQAX partnership for DCSA eBL 3.0 (June 2025)
  - No public Track & Trace API

#### Technical Details
- **Architecture:** No public API available
- **Rate Limits:** N/A
- **Polling Frequency:** N/A
- **Integration Options:**
  - Flexport SynCon Hub partnership (limited)
  - Third-party aggregators only

#### Pricing
- N/A (no direct API access)

#### Notes
- One of the largest carriers, but limited API development
- Working on DCSA compliance initiatives
- **MUST use aggregator solution** for integration
- Not recommended for direct integration at this time

---

### 1.5 Hapag-Lloyd

**Official API:** YES
**API Portal:** https://api-portal.hlag.com/
**Documentation:** https://doc.api-portal.hlag.com/

#### Capabilities
- **Authentication:** OAuth 2.0 / API Key
- **Tracking Methods:**
  - Equipment Reference (container number)
  - Carrier Booking Reference
  - Transport Document Reference
- **Real-time:** Yes, real-time data access
- **DCSA Compliance:** YES
  - Track & Trace API follows DCSA Industry Blueprint
  - DCSA-compliant commercial vessel schedules API
  - Active DCSA participant

#### Technical Details
- **Architecture:** RESTful API
- **Rate Limits:** Not publicly disclosed
- **Polling Frequency:** Real-time queries supported
- **Sandbox:** YES - Safe testing environment available
- **Available APIs:**
  - Track & Trace
  - Pricing/Quotations
  - Route Planning
  - Reefer Monitoring
  - Vessel Schedules

#### Pricing
- Contact for pricing details via API portal
- Registration process with step-by-step guides

#### Notes
- Excellent developer portal with sandbox
- Strong documentation
- Active GitHub presence (github.com/Hapag-Lloyd)
- Recommended for direct integration

---

### 1.6 ONE (Ocean Network Express)

**Official API:** NO
**Official Website:** https://ecomm.one-line.com/

#### Capabilities
- **Authentication:** N/A (no public API)
- **Tracking Methods:** Web-based tracking only
- **Real-time:** Not available via direct API
- **DCSA Compliance:** Unknown

#### Technical Details
- **Architecture:** No public API
- **Rate Limits:** N/A
- **Polling Frequency:** N/A
- **Integration Options:** Third-party aggregators only

#### Pricing
- N/A (no direct API)

#### Notes
- Formed in 2017 from MOL, NYK, and K Line merger
- Headquarters: Tokyo and Singapore
- Growing carrier but no public API program
- **MUST use aggregator solution** for integration
- Not recommended for direct integration

---

### 1.7 Evergreen Line

**Official API:** YES
**API Portal:** https://www.shipmentlink.com/_ec/APIPORTAL_Home

#### Capabilities
- **Authentication:** API Key (via sales representative registration)
- **Tracking Methods:**
  - Shipment Event tracking
  - Container tracking
  - Transport tracking
- **Real-time:** Yes, push-based (Evergreen pushes when events occur)
- **DCSA Compliance:** YES
  - Active DCSA participant since 2019
  - Track & Trace 2.2 ✓
  - Operational Vessel Schedule 3.0 ✓
  - Bill of Lading 3.0 Beta ✓
  - Commercial Schedules 1.0 ✓
  - Just-in-Time Port Call 1.2 Beta 1 ✓

#### Technical Details
- **Architecture:** RESTful API with Shipment Event concept
- **Rate Limits:** Not publicly disclosed
- **Polling Frequency:** Push-based updates
- **Available APIs:**
  - Track & Trace
  - Booking
  - Shipping Instruction
  - Transport Document
  - Electronic Bill of Lading (eBL)
  - Commercial Schedules

#### Pricing
- Contact Evergreen Sales Representative
- Subscription-based model
- Enterprise pricing

#### Notes
- Strong DCSA commitment with multiple standards implemented
- Requires sales representative contact for access
- Comprehensive API suite
- Recommended for direct integration

---

### 1.8 Yang Ming

**Official API:** NO
**Official Website:** https://www.yangming.com/

#### Capabilities
- **Authentication:** N/A (no public API)
- **Tracking Methods:** Web-based tracking only
- **Real-time:** Not available via direct API
- **DCSA Compliance:** YES (implemented via DCSA member)
  - Track & Trace 2.2 implementation confirmed

#### Technical Details
- **Architecture:** No public API portal
- **Rate Limits:** N/A
- **Polling Frequency:** N/A
- **Integration Options:** Third-party aggregators only

#### Pricing
- N/A (no direct API)

#### Notes
- DCSA-compliant but no public developer program
- **MUST use aggregator solution** for integration
- Not recommended for direct integration

---

### 1.9 HMM (Hyundai Merchant Marine)

**Official API:** NO
**Official Website:** https://www.hmm21.com/

#### Capabilities
- **Authentication:** N/A (no public API)
- **Tracking Methods:** Web-based tracking only
- **Real-time:** Not available via direct API
- **DCSA Compliance:** YES (implemented)
  - Track & Trace 2.2 confirmed
- **SCAC Code:** HDMU

#### Technical Details
- **Architecture:** No public API portal
- **Rate Limits:** N/A
- **Polling Frequency:** N/A
- **Integration Options:** Third-party aggregators only

#### Pricing
- N/A (no direct API)

#### Notes
- DCSA-compliant carrier
- **MUST use aggregator solution** for integration
- Not recommended for direct integration

---

### 1.10 ZIM Integrated Shipping

**Official API:** YES
**API Support:** https://www.zim.com/contact-us/zim-api-support
**Terms:** https://www.zim.com/help/api-terms-and-conditions

#### Capabilities
- **Authentication:** API Token (via registration and approval)
- **Tracking Methods:**
  - Container tracking
  - B/L tracking
  - Booking tracking
- **Real-time:** Yes
- **DCSA Compliance:** Partial (standards adoption in progress)

#### Technical Details
- **Architecture:** RESTful API (Application Program Interface)
- **Rate Limits:** Not publicly disclosed
- **Polling Frequency:** Real-time queries
- **Registration Required:** Yes, must obtain security token via registration

#### Pricing
- Contact ZIM API Support for pricing
- Registration process required

#### Notes
- API documentation provided after registration
- Requires formal application and approval
- Growing API program
- Recommended for direct integration (with registration)

---

## 2. DCSA (Digital Container Shipping Association) Standards

### Overview
The Digital Container Shipping Association (DCSA) is a neutral, non-profit group established to further digitalization of container shipping through technology standards.

### Current Standards (2025)

#### Track & Trace Versions
- **Track & Trace 3.0 Beta 1** (latest, in testing)
- **Track & Trace 2.2** (widely implemented - current production standard)
- **Track & Trace 2.1** (legacy)

#### Implementation Status
**Carriers implementing T&T 2.2:**
- Maersk ✓
- MSC ✓
- CMA CGM ✓
- Hapag-Lloyd ✓
- Evergreen ✓
- Yang Ming ✓
- HMM ✓
- ONE ✓
- ZIM (in progress)

#### Other DCSA Standards
- **Booking API** (v2.0)
- **Bill of Lading (eBL) API** (v3.0 Beta)
- **Operational Vessel Schedules** (v3.0 Beta 1)
- **Commercial Schedules** (v1.0)
- **Just-in-Time Port Call** (v1.2 Beta 1)

### Key Features
- Interoperable data models
- Standardized data definitions
- RESTful APIs published on SwaggerHub
- Real-time exchange of digital shipping data
- Push-based and pull-based mechanisms
- Webhook support for events

### Benefits for Integration
- **Uniform data structure** across carriers
- **Reduced integration complexity** with standardized formats
- **Future-proof** as more carriers adopt standards
- **Better data quality** with consistent definitions

### Port of Rotterdam Milestone
In April 2025, Port of Rotterdam became the first major port to include DCSA Track & Trace Standard in its Port Community System (Portbase), demonstrating real-world adoption.

---

## 3. Alternative Aggregator Solutions Comparison

### 3.1 ShipsGo

**Website:** https://shipsgo.com/
**API Documentation:** https://shipsgo.com/ocean/container-tracking-api

#### Coverage
- **Ocean Carriers:** 160+ carriers
- **Coverage:** All major shipping lines including Maersk, MSC, CMA CGM, Hapag-Lloyd, ZIM, OOCL, COSCO, Evergreen
- **Route Coverage:** 300,000+ ocean routes
- **Air Cargo:** Yes, AWB tracking from multiple airlines

#### Tracking Capabilities
- Container number tracking
- Bill of Lading tracking
- Booking number tracking
- Real-time geographic position monitoring
- Vessel position on live map
- Container events/milestones (gate-in to empty return)

#### Technical Features
- **API Type:** RESTful JSON
- **Authentication:** API Key
- **Rate Limits:** 100 requests per minute (company-wide)
- **Webhooks:** Yes, instant shipment status updates
- **Data Format:** Standardized JSON
- **Real-time Updates:** Yes

#### Pricing Model
- **Credit-based system**
- **1 credit per shipment** (new MBL, Booking, or Container number)
- **Unlimited API calls** after shipment creation (no extra cost)
- **No expiration** on credits
- **Volume discounts** via bonus credits
- **No setup fees**
- **No unexpected costs**

#### Pros
- Transparent credit-based pricing
- Unlimited API calls per shipment
- No credit expiration
- Good carrier coverage (160+)
- Air cargo tracking included
- Simple pricing model

#### Cons
- 100 req/min rate limit may be restrictive for high-volume
- Less established than some competitors
- Pricing not disclosed upfront (volume-based)

---

### 3.2 TrackingMore

**Website:** https://www.trackingmore.com/
**API Documentation:** https://www.trackingmore.com/tracking-api

#### Coverage
- **Total Carriers:** 1,452+ carriers
- **Ocean Carriers:** Included in carrier network
- **Global Coverage:** Comprehensive (UPS, FedEx, DHL, USPS, Royal Mail, etc.)
- **Data Consolidation:** 1,334 carriers consolidated into 8 main statuses and 28 sub-statuses

#### Tracking Capabilities
- Multi-carrier package tracking
- Detailed tracking events
- Estimated delivery times (ETA)
- Automated order tracking notifications
- Status consolidation and normalization

#### Technical Features
- **API Type:** RESTful JSON
- **Authentication:** API Key
- **Rate Limits:** Up to 100 QPS (queries per second)
- **Webhooks:** Yes, real-time status change notifications
- **Data Format:** Standardized JSON (8 main statuses, 28 sub-statuses)
- **Uptime:** 99.9%
- **SDKs:** 7 languages available on GitHub
- **Postman Support:** Yes

#### Pricing Model
- **Free Trial:** 14 days
- **Starter Tier:** $11/month (extra credits at $0.04 each)
- **API Pricing Tiers:**
  - 2,000 shipments/month: $74/month ($0.037 per shipment)
  - 3,000 shipments/month: $109/month ($0.036 per shipment)
  - 5,000 shipments/month: $159/month ($0.0318 per shipment)
- **Volume discounts** for higher tiers

#### Pros
- Largest carrier coverage (1,452+)
- Excellent data normalization (8 main statuses)
- 14-day free trial
- High rate limit (100 QPS)
- Clear, transparent pricing
- 99.9% uptime SLA
- Strong developer resources (SDKs, Postman)
- Best for e-commerce/parcel tracking

#### Cons
- Focus on parcel/courier tracking (less ocean freight focused)
- May have more features than needed for ocean freight only
- Pricing can add up for high volumes

---

### 3.3 VIZION API

**Website:** https://www.vizionapi.com/
**Documentation:** https://docs.vizionapi.com/

#### Coverage
- **Ocean Carriers:** 99% of global ocean freight shipments
- **Data Sources:** 7,000+ raw data points from dozens of sources
- **North America Focus:** 100% of carriers touching North America
- **Data Cleaning:** 60+ standardized event milestones

#### Tracking Capabilities
- Real-time container locations and ETAs
- Transshipment information updates
- Complete updates from carriers, terminals, customs
- Automatic carrier identification
- Last Free Date event alerts (demurrage)
- Class I railway tracking across North America
- Port and terminal geo-fencing
- AIS data (terrestrial and satellite)

#### Technical Features
- **API Type:** Push-based RESTful API
- **Authentication:** API Key
- **Rate Limits:** Not disclosed (enterprise-level)
- **Webhooks:** Yes, real-time event responses
- **Data Format:** Standardized JSON
- **Refresh Frequency:** Multiple times daily (latency < 6 hours)
- **Update Speed:** Seconds when new events occur
- **Integrations:** Looker, ThoughtSpot, Domo, Tableau, Power BI, Google Sheets, Excel

#### Pricing Model
- **Subscription-based**
- **Contact for pricing** (not publicly disclosed)
- **Core tier** and premium tiers available
- Industry sources suggest: ~$300/month starting (5 seats) + $75/seat additional
- Enterprise-level pricing

#### Pros
- Highest ocean freight coverage (99%)
- Excellent data quality and standardization
- Push-based real-time updates
- Rail tracking included
- AIS data integration
- Strong BI tool integrations
- Best for data-driven teams

#### Cons
- No transparent pricing
- Higher cost (enterprise-focused)
- May be overkill for smaller operations
- Requires sales contact

---

### 3.4 MarineTraffic (Kpler)

**Website:** https://www.marinetraffic.com/
**API Documentation:** https://container-tracking.marinetraffic.com/

#### Coverage
- **AIS Network:** 13,000+ AIS receivers globally (coastal, ocean, satellite)
- **Ocean Carriers:** Supported shipping lines (extensive but not enumerated)
- **Coverage Type:** Real-time vessel tracking with AIS
- **Global Coverage:** 24/7 AIS transmission capture

#### Tracking Capabilities
- Real-time vessel tracking
- Container tracking by container/booking/B/L
- Real-time milestones (loaded, unloaded, transshipped, gated in/out)
- Vessel positions in API payload when containers onboard
- Full shipment journey tracking
- Delay and rollover updates
- Port congestion data
- Weather maps and nautical charts

#### Technical Features
- **API Type:** RESTful API (V2 launched December 2024)
- **Authentication:** API Key
- **Rate Limits:** 200 requests per minute
- **Webhooks:** Yes, shipment event notifications
- **Data Format:** JSON with DCSA standards integration
- **Real-time Updates:** Yes, with webhook notifications (no frequent polling needed)
- **AIS Data:** Terrestrial and satellite coverage

#### Pricing Model
- **Basic Plan:** $10/month (billed monthly)
- **Free Trial:** 7 days
- **Container Tracking API:** $15 one-time payment (basic)
- **Add-ons required for:**
  - Satellite coverage
  - Historical data
  - Multiple vessel tracking
- **Enterprise Pricing:** Contact for quotes
- **Note:** Costs can add up quickly with add-ons

#### Pros
- Extensive AIS network (13,000+ receivers)
- Real-time vessel position data
- DCSA-compliant V2 APIs
- 7-day free trial
- Low entry cost ($10/month basic)
- Nautical charts and weather data
- Port congestion insights

#### Cons
- Rate limit (200 req/min) may be restrictive
- Add-on costs accumulate quickly
- More vessel-focused than container-focused
- Complex pricing with multiple add-ons
- Better for vessel tracking than container tracking

---

### 3.5 Additional Notable Aggregators

#### JSONCargo
- **Coverage:** 95% of global shipping market
- **Carriers:** Major lines (Maersk, Hapag-Lloyd, ONE, MSC, HMM, CMA CGM)
- **Pricing:** Starting at $9/month (trial pricing)
  - Mariner: 11 EUR trial → 99 EUR/month
  - Navigator: 22 EUR trial → 299 EUR/month
  - Admiral: 39 EUR trial → 499 EUR/month
- **Features:** Real-time tracking, B/L tracking, carrier tracking, vessel tracking
- **Pros:** Very affordable, flexible plans, no contracts
- **Cons:** Smaller provider, less established

#### Terminal49
- **Coverage:** 100% of carriers touching North America, 150+ data sources
- **Focus:** North America logistics (terminals, rails, ocean carriers)
- **Pricing:** Free tier (100 containers), usage-based pricing after
- **Free Plan:** 50 shipments/month
- **Features:** 99.5% API uptime, push-based webhooks, <1 hour updates
- **Pros:** Best for North America, excellent data quality (99%+ completion), free tier
- **Cons:** Primarily North America focused, less global coverage

---

## 4. Aggregator Solutions - Feature Comparison Matrix

| Feature | ShipsGo | TrackingMore | VIZION API | MarineTraffic | JSONCargo | Terminal49 |
|---------|---------|--------------|------------|---------------|-----------|------------|
| **Ocean Carriers** | 160+ | 1,452+ (all types) | 99% global | Extensive | 95% market | 100% N.America |
| **Entry Price** | Contact | $11/mo | $300/mo | $10/mo | $9/mo | Free (100 cnt) |
| **Rate Limits** | 100 req/min | 100 QPS | Enterprise | 200 req/min | Not disclosed | Not disclosed |
| **Webhooks** | Yes | Yes | Yes | Yes | Yes | Yes |
| **DCSA Compliant** | Partial | Yes | Yes | Yes (V2) | Yes | Yes |
| **Real-time** | Yes | Yes | Yes (push) | Yes | Yes | Yes (push) |
| **Free Trial** | No (credit) | 14 days | No | 7 days | Trial pricing | 50 ship/mo |
| **Data Quality** | Good | Excellent | Excellent | Good | Good | Excellent |
| **Best For** | Ocean freight | Multi-carrier | Data teams | Vessel tracking | Budget-conscious | North America |
| **Pricing Model** | Credit-based | Per shipment | Subscription | Tiered + addons | Subscription | Usage-based |

---

## 5. Implementation Recommendations

### 5.1 Recommended Integration Strategy

#### Phase 1: Aggregator Foundation (Recommended Start)
**Duration:** 4-6 weeks
**Approach:** Implement single aggregator for all 10 carriers

**Recommended Aggregator:** **VIZION API** or **TrackingMore**

**Rationale:**
1. **Uniform Coverage:** Single integration covers all 10 carriers (including those without public APIs)
2. **Standardized Data:** One data format across all carriers reduces complexity
3. **Faster Implementation:** 1 integration vs. 6-10 separate integrations
4. **DCSA Compliant:** Both providers normalize data to DCSA standards
5. **Proven Reliability:** Established providers with SLAs and support
6. **Future-proof:** Aggregators handle carrier API changes/deprecations

**VIZION API** - Choose if:
- Budget allows enterprise pricing (~$300+/month)
- Need highest data quality (99%+ completion rates)
- Require <1 hour data refresh
- Want push-based real-time updates
- Need rail tracking (North America)
- Have data analytics needs (BI tool integrations)

**TrackingMore** - Choose if:
- Need cost-effective solution ($74-$159/month for 2,000-5,000 shipments)
- Want transparent, predictable pricing
- 14-day trial to validate fit
- Need high rate limits (100 QPS)
- Value extensive carrier coverage (1,452+)
- Want strong developer resources (SDKs, docs)

**Alternative Budget Option:** **JSONCargo** ($9-$99/month) for smaller operations

---

#### Phase 2: Hybrid Model (Optional Enhancement)
**Duration:** 8-12 weeks
**Approach:** Direct integration with top carriers + aggregator fallback

**Direct Integrations Priority Order:**
1. **Maersk** - Most mature API, excellent docs, DCSA leader
2. **Hapag-Lloyd** - Great developer portal with sandbox, strong docs
3. **CMA CGM** - Comprehensive API portal, DCSA compliant
4. **MSC** - Second largest carrier, DCSA compliant
5. **Evergreen** - Full DCSA implementation, push-based events
6. **ZIM** - Growing API program, good support

**Keep Aggregator for:**
- COSCO (no public API)
- ONE (no public API)
- Yang Ming (no public API)
- HMM (no public API)
- Backup/fallback for direct integrations
- Historical data gaps

**Benefits:**
- Reduced aggregator costs for high-volume carriers
- More control over data refresh rates
- Direct carrier support channels
- Potential for carrier-specific features

**Drawbacks:**
- 6x integration complexity
- Maintenance burden for multiple APIs
- Carrier API changes require updates
- Different data formats to normalize
- Higher development cost

---

#### Phase 3: Full Direct Integration (Future State)
**Duration:** 16-24 weeks
**Approach:** Direct integration with all carriers offering public APIs

**Not Recommended Unless:**
- Very high shipment volumes (>50,000/month) justify cost savings
- Need carrier-specific features not available via aggregators
- Have dedicated API maintenance team
- Budget for ongoing carrier API change management

---

### 5.2 Carrier Stability Assessment

#### Stable Public APIs (Recommended for Direct Integration)
**Tier 1 - Excellent Stability:**
- Maersk (mature API program, DCSA leader)
- Hapag-Lloyd (sandbox, active development, GitHub presence)
- CMA CGM (early DCSA adopter, comprehensive portal)

**Tier 2 - Good Stability:**
- MSC (DCSA compliant, but registration required)
- Evergreen (strong DCSA commitment, multiple standards)
- ZIM (growing API program, registration process)

#### Requires Aggregator (No Stable Public API)
**Must Use Aggregator:**
- COSCO (limited API, working on DCSA compliance)
- ONE (no public API program)
- Yang Ming (DCSA compliant but no developer program)
- HMM (DCSA compliant but no public API)

---

### 5.3 Cost Analysis

#### Aggregator-Only Approach (Phase 1)

**TrackingMore Pricing Example:**
- 2,000 shipments/month: $74/month ($888/year)
- 5,000 shipments/month: $159/month ($1,908/year)
- 10,000 shipments/month: ~$300-400/month estimate

**VIZION API Pricing Example:**
- Starting: ~$300/month ($3,600/year)
- Enterprise: Contact for pricing
- Best for: >5,000 shipments/month

**Development Cost:**
- Single integration: 80-120 hours
- Cost estimate: $8,000-$15,000 (one-time)
- Maintenance: Minimal (aggregator handles carrier changes)

**Total Year 1 (TrackingMore):**
- Development: $10,000
- Subscription: $888-$1,908
- **Total: $10,888-$11,908**

---

#### Hybrid Approach (Phase 2)

**Aggregator Cost:**
- Lower volume (fallback only): $50-$100/month
- Annual: $600-$1,200

**Development Cost:**
- 6 carrier direct integrations: 320-480 hours
- Aggregator integration: 80-120 hours
- Cost estimate: $40,000-$60,000 (one-time)
- Maintenance: Medium (6 carrier APIs + aggregator)

**Annual Maintenance:**
- API monitoring: 40 hours/year
- Carrier API updates: 80-120 hours/year
- Cost estimate: $12,000-$16,000/year

**Total Year 1 (Hybrid):**
- Development: $50,000
- Aggregator: $1,200
- Maintenance: $14,000
- **Total: $65,200**

**Break-even Analysis:**
- Additional cost vs. aggregator-only: $54,312
- Only justified if high volume reduces aggregator costs significantly

---

### 5.4 Recommended Architecture for Phase 6

#### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    SCH-PRO-NEXT Application                  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │          Tracking Service (Abstraction Layer)          │ │
│  │  - Unified interface for all carrier tracking         │ │
│  │  - Data normalization to internal format              │ │
│  │  - Webhook event processing                           │ │
│  │  - Rate limiting and retry logic                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                              │                                │
│                              ▼                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            Carrier Adapter Registry                    │ │
│  │  - Factory pattern for carrier selection              │ │
│  │  - Configuration per carrier                          │ │
│  └────────────────────────────────────────────────────────┘ │
│         │                    │                    │           │
│         ▼                    ▼                    ▼           │
│  ┌────────────┐      ┌────────────┐      ┌────────────┐    │
│  │  Aggregator│      │   Direct   │      │  Fallback  │    │
│  │   Adapter  │      │  Carrier   │      │   Adapter  │    │
│  │            │      │  Adapters  │      │            │    │
│  └────────────┘      └────────────┘      └────────────┘    │
└───────│─────────────────────│─────────────────────│─────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌─────────────────────┐   ┌──────────┐
│   VIZION or  │    │  Carrier Direct APIs │   │ ShipsGo  │
│ TrackingMore │    │  - Maersk           │   │  (backup)│
│              │    │  - Hapag-Lloyd      │   │          │
└──────────────┘    │  - CMA CGM          │   └──────────┘
                    │  - MSC              │
                    │  - Evergreen        │
                    │  - ZIM              │
                    └─────────────────────┘
```

#### Core Architecture Principles

**1. Abstraction Layer Pattern**
```typescript
// src/lib/tracking/TrackingService.ts
interface ITrackingService {
  trackContainer(containerNumber: string, carrier: string): Promise<TrackingData>
  trackBillOfLading(blNumber: string, carrier: string): Promise<TrackingData>
  subscribeToUpdates(shipmentId: string, webhookUrl: string): Promise<void>
  unsubscribe(shipmentId: string): Promise<void>
}
```

**2. Carrier Adapter Pattern**
```typescript
// src/lib/tracking/adapters/ICarrierAdapter.ts
interface ICarrierAdapter {
  name: string
  supports(carrier: string): boolean
  track(reference: string, type: ReferenceType): Promise<RawTrackingData>
  normalizeData(raw: RawTrackingData): TrackingData
  handleWebhook(payload: unknown): TrackingEvent
}
```

**3. Factory Pattern for Carrier Selection**
```typescript
// src/lib/tracking/CarrierAdapterFactory.ts
class CarrierAdapterFactory {
  private adapters: ICarrierAdapter[] = []

  register(adapter: ICarrierAdapter): void
  getAdapter(carrier: string): ICarrierAdapter
  getAdapters(): ICarrierAdapter[]
}
```

---

#### Key Implementation Files

```
src/lib/tracking/
├── TrackingService.ts              # Main service interface
├── CarrierAdapterFactory.ts        # Factory for adapter selection
├── types.ts                        # Shared TypeScript types
├── normalizers/
│   ├── DCsANormalizer.ts          # DCSA format normalizer
│   └── InternalNormalizer.ts      # App-specific format
├── adapters/
│   ├── ICarrierAdapter.ts         # Adapter interface
│   ├── VizionAdapter.ts           # VIZION API adapter (recommended)
│   ├── TrackingMoreAdapter.ts     # TrackingMore adapter (alternative)
│   ├── MaerskAdapter.ts           # Direct Maersk (optional Phase 2)
│   ├── HapagAdapter.ts            # Direct Hapag-Lloyd (optional Phase 2)
│   └── FallbackAdapter.ts         # Fallback/error handling
├── webhooks/
│   └── WebhookHandler.ts          # Webhook processing
└── utils/
    ├── RateLimiter.ts             # Rate limiting
    ├── RetryPolicy.ts             # Retry logic
    └── CacheManager.ts            # Response caching
```

---

#### Data Model - Normalized Tracking Data

```typescript
// src/lib/tracking/types.ts

export enum TrackingStatus {
  BOOKED = 'BOOKED',
  GATE_IN = 'GATE_IN',
  LOADED = 'LOADED',
  DEPARTED = 'DEPARTED',
  TRANSSHIPMENT = 'TRANSSHIPMENT',
  ARRIVED = 'ARRIVED',
  DISCHARGED = 'DISCHARGED',
  GATE_OUT = 'GATE_OUT',
  EMPTY_RETURN = 'EMPTY_RETURN',
  UNKNOWN = 'UNKNOWN',
}

export enum EventType {
  EQUIPMENT = 'EQUIPMENT',    // Container events
  SHIPMENT = 'SHIPMENT',      // Shipment-level events
  TRANSPORT = 'TRANSPORT',    // Vessel/voyage events
}

export interface TrackingEvent {
  eventType: EventType
  eventCode: string
  eventName: string
  eventDateTime: string
  status: TrackingStatus
  location: {
    name: string
    unlocode?: string
    city?: string
    country?: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  vessel?: {
    name: string
    imo?: string
    voyage?: string
  }
  terminal?: string
  transportMode?: 'VESSEL' | 'RAIL' | 'TRUCK' | 'BARGE'
  emptyIndicator?: boolean
}

export interface TrackingData {
  containerNumber?: string
  billOfLading?: string
  bookingNumber?: string
  carrier: {
    name: string
    scac: string
  }
  status: TrackingStatus
  currentLocation?: string
  lastUpdated: string
  eta?: string
  atd?: string
  ata?: string
  originPort: string
  destinationPort: string
  events: TrackingEvent[]
  metadata: {
    source: string        // 'VIZION', 'TrackingMore', 'Maersk', etc.
    dataQuality: 'HIGH' | 'MEDIUM' | 'LOW'
    lastRefresh: string
  }
}
```

---

#### API Route Structure

```
src/app/api/
├── tracking/
│   ├── container/
│   │   └── route.ts              # GET /api/tracking/container?number=XXX&carrier=YYY
│   ├── bl/
│   │   └── route.ts              # GET /api/tracking/bl?number=XXX&carrier=YYY
│   ├── booking/
│   │   └── route.ts              # GET /api/tracking/booking?number=XXX&carrier=YYY
│   ├── webhook/
│   │   └── route.ts              # POST /api/tracking/webhook (receive updates)
│   └── subscribe/
│       └── route.ts              # POST /api/tracking/subscribe (setup tracking)
```

---

#### Configuration Management

```typescript
// src/lib/tracking/config.ts

export const TRACKING_CONFIG = {
  // Primary aggregator (choose one)
  primaryAdapter: 'VIZION', // or 'TRACKINGMORE'

  // Aggregator credentials
  aggregators: {
    VIZION: {
      apiKey: process.env.VIZION_API_KEY,
      baseUrl: 'https://api.vizionapi.com',
      timeout: 30000,
      retryAttempts: 3,
    },
    TRACKINGMORE: {
      apiKey: process.env.TRACKINGMORE_API_KEY,
      baseUrl: 'https://api.trackingmore.com',
      timeout: 30000,
      retryAttempts: 3,
    },
  },

  // Direct carrier APIs (Phase 2)
  carriers: {
    MAERSK: {
      enabled: false, // Set true when implementing Phase 2
      apiKey: process.env.MAERSK_API_KEY,
      baseUrl: 'https://api.maersk.com',
    },
    HAPAG_LLOYD: {
      enabled: false,
      apiKey: process.env.HAPAG_API_KEY,
      baseUrl: 'https://api-portal.hlag.com',
    },
    // ... other carriers
  },

  // Fallback strategy
  fallback: {
    enabled: true,
    adapter: 'SHIPSGO',
    apiKey: process.env.SHIPSGO_API_KEY,
  },

  // Caching
  cache: {
    enabled: true,
    ttl: 3600, // 1 hour cache for tracking data
    redisUrl: process.env.REDIS_URL,
  },

  // Rate limiting
  rateLimit: {
    enabled: true,
    maxRequestsPerMinute: 100,
  },

  // Webhooks
  webhooks: {
    enabled: true,
    publicUrl: process.env.APP_URL + '/api/tracking/webhook',
    secret: process.env.WEBHOOK_SECRET,
  },
}
```

---

#### Environment Variables

```bash
# .env.local

# Primary Aggregator (choose one)
VIZION_API_KEY=your_vizion_key
# OR
TRACKINGMORE_API_KEY=your_trackingmore_key

# Fallback Aggregator
SHIPSGO_API_KEY=your_shipsgo_key

# Direct Carrier APIs (Phase 2 - optional)
MAERSK_API_KEY=your_maersk_key
HAPAG_API_KEY=your_hapag_key
CMA_CGM_API_KEY=your_cma_cgm_key
MSC_API_KEY=your_msc_key
EVERGREEN_API_KEY=your_evergreen_key
ZIM_API_KEY=your_zim_key

# Caching
REDIS_URL=redis://localhost:6379

# Webhooks
APP_URL=https://your-app.com
WEBHOOK_SECRET=your_webhook_secret
```

---

### 5.5 Implementation Timeline

#### Phase 1: Aggregator Foundation (Recommended)

**Week 1-2: Research & Selection**
- [ ] Compare VIZION vs TrackingMore pricing for volume
- [ ] Sign up for trial accounts
- [ ] Test API with sample data
- [ ] Validate carrier coverage
- [ ] Make final aggregator selection

**Week 3-4: Core Development**
- [ ] Create tracking service abstraction layer
- [ ] Implement carrier adapter interface
- [ ] Build aggregator adapter (VIZION or TrackingMore)
- [ ] Create data normalization layer
- [ ] Implement TypeScript types
- [ ] Unit tests for adapters

**Week 5-6: Integration & Testing**
- [ ] Create API routes for container/BL/booking tracking
- [ ] Implement webhook handler
- [ ] Set up Redis caching
- [ ] Rate limiting implementation
- [ ] Integration tests with real API
- [ ] Test all 10 carriers via aggregator

**Week 7: Production Deployment**
- [ ] Environment configuration
- [ ] Webhook URL setup
- [ ] Monitoring and logging
- [ ] Deploy to production
- [ ] Validate with real shipments

---

#### Phase 2: Hybrid Model (Optional - Future)

**Month 3-4: Direct Integrations**
- [ ] Implement Maersk adapter
- [ ] Implement Hapag-Lloyd adapter
- [ ] Implement CMA CGM adapter
- [ ] Testing and validation
- [ ] Gradual rollout per carrier

**Month 5: Additional Carriers**
- [ ] Implement MSC adapter
- [ ] Implement Evergreen adapter
- [ ] Implement ZIM adapter
- [ ] Comprehensive testing

**Month 6: Optimization**
- [ ] Performance tuning
- [ ] Cost analysis and optimization
- [ ] Carrier API monitoring
- [ ] Documentation

---

### 5.6 Risk Mitigation

#### Technical Risks

**Risk:** Aggregator API changes or downtime
**Mitigation:**
- Implement fallback to secondary aggregator (e.g., ShipsGo)
- Cache tracking data with reasonable TTL
- Monitor API health with alerts
- Maintain direct carrier adapter code (even if not active)

**Risk:** Data quality issues from aggregator
**Mitigation:**
- Implement data validation layer
- Track data quality metrics per carrier
- Use multiple sources for critical shipments
- Provide user feedback mechanism for bad data

**Risk:** Rate limit exceeded
**Mitigation:**
- Implement request queuing
- Cache aggressively
- Batch requests where possible
- Monitor usage against limits

#### Business Risks

**Risk:** Aggregator pricing increases
**Mitigation:**
- Negotiate annual contracts
- Have backup aggregator tested and ready
- Maintain Phase 2 hybrid architecture as option
- Monitor cost per shipment tracked

**Risk:** Carrier not supported by aggregator
**Mitigation:**
- Verify carrier list before commitment
- Implement adapter pattern for easy additions
- Have ShipsGo as ultimate fallback (160+ carriers)

---

### 5.7 Success Metrics

#### Technical KPIs
- **API Response Time:** < 2 seconds (95th percentile)
- **API Uptime:** > 99.5%
- **Data Freshness:** < 6 hours for critical events
- **Error Rate:** < 1% failed requests
- **Cache Hit Rate:** > 60%

#### Business KPIs
- **Carrier Coverage:** 100% of top 10 carriers
- **Tracking Success Rate:** > 95% successful tracks
- **Cost per Shipment Tracked:** < $0.10
- **User Satisfaction:** > 4/5 for tracking accuracy

#### Data Quality KPIs
- **Event Completeness:** > 90% of events captured
- **ETA Accuracy:** Within 24 hours of actual arrival
- **Location Accuracy:** Correct port/terminal 95%+ of time

---

## 6. Final Recommendations Summary

### Immediate Action Items (Phase 1)

**1. Select Aggregator**
- **For Budget-Conscious:** TrackingMore ($74-$159/month)
- **For Data Quality:** VIZION API (~$300/month)
- **For Small Operations:** JSONCargo ($9-$99/month)

**2. Architecture**
- Implement abstraction layer with adapter pattern
- Use DCSA-normalized data model
- Build for Phase 2 (direct integration) optionality
- Cache aggressively to reduce API costs

**3. Development Priority**
- Week 1-2: Aggregator selection and trial
- Week 3-4: Core adapter development
- Week 5-6: Integration and testing
- Week 7: Production deployment

**4. Monitoring**
- Set up API health monitoring
- Track cost per shipment
- Monitor data quality per carrier
- User feedback on tracking accuracy

---

### Future Considerations (Phase 2+)

**When to Move to Hybrid Model:**
- Shipment volume > 10,000/month
- Aggregator costs > $500/month
- Need carrier-specific features
- Have dedicated API maintenance resources

**Direct Integration Priority:**
1. Maersk (best API, largest carrier)
2. Hapag-Lloyd (excellent developer experience)
3. CMA CGM (comprehensive portal)
4. Others based on volume

**Keep Aggregator For:**
- COSCO, ONE, Yang Ming, HMM (no public APIs)
- Backup/failover
- New carrier additions
- Historical data gaps

---

## 7. Resources & Documentation

### Official Carrier Developer Portals
- **Maersk:** https://developer.maersk.com/
- **MSC:** https://developerportal.msc.com/
- **CMA CGM:** https://api-portal.cma-cgm.com/
- **Hapag-Lloyd:** https://api-portal.hlag.com/
- **Evergreen:** https://www.shipmentlink.com/_ec/APIPORTAL_Home
- **ZIM:** https://www.zim.com/contact-us/zim-api-support

### DCSA Resources
- **Main Site:** https://dcsa.org/
- **Standards:** https://dcsa.org/standards
- **Developer Portal:** https://developer.dcsa.org/
- **Track & Trace:** https://developer.dcsa.org/explore-apis/track-and-trace
- **GitHub:** https://github.com/dcsaorg

### Aggregator Resources
- **VIZION API:** https://www.vizionapi.com/ | https://docs.vizionapi.com/
- **TrackingMore:** https://www.trackingmore.com/ | https://www.trackingmore.com/docs/
- **ShipsGo:** https://shipsgo.com/ | https://blog.shipsgo.com/
- **MarineTraffic:** https://www.marinetraffic.com/ | https://container-tracking.marinetraffic.com/
- **JSONCargo:** https://jsoncargo.com/ | https://jsoncargo.com/documentation-api/
- **Terminal49:** https://terminal49.com/ | https://terminal49.com/docs/

### Industry Standards
- **DCSA Standards:** https://dcsa.org/standards
- **SwaggerHub (DCSA):** https://app.swaggerhub.com/organizations/dcsaorg

---

## Appendix A: Carrier Contact Information

### For API Access Registration

**Maersk:**
- Developer Portal: https://developer.maersk.com/
- Contact: Via developer portal registration

**MSC:**
- Developer Portal: https://developerportal.msc.com/
- Contact: Direct Integration Request Form on website

**CMA CGM:**
- API Portal: https://api-portal.cma-cgm.com/
- Contact: Register on portal

**Hapag-Lloyd:**
- API Portal: https://api-portal.hlag.com/
- Documentation: https://doc.api-portal.hlag.com/
- Contact: Registration via portal

**Evergreen:**
- API Portal: https://www.shipmentlink.com/_ec/APIPORTAL_Home
- Contact: Evergreen Sales Representative (required)

**ZIM:**
- API Support: https://www.zim.com/contact-us/zim-api-support
- Terms: https://www.zim.com/help/api-terms-and-conditions
- Contact: Via API support form

---

## Appendix B: DCSA Event Codes Reference

### Common Track & Trace Event Types (DCSA 2.2)

**Equipment Events (Container-Level):**
- `LOAD` - Container loaded onto vessel
- `DISC` - Container discharged from vessel
- `GTIN` - Container gated in at terminal
- `GTOT` - Container gated out from terminal
- `STUF` - Container stuffed (loaded with cargo)
- `STRP` - Container stripped (emptied)
- `PICK` - Container picked up
- `DROP` - Container dropped off
- `INSP` - Container inspected
- `RSEA` - Container resealed

**Shipment Events (Booking-Level):**
- `RECE` - Shipment received
- `CONF` - Shipment confirmed
- `ISSU` - Documentation issued
- `APPR` - Documentation approved
- `SUBM` - Documentation submitted
- `SURR` - Documentation surrendered
- `PENU` - Pending update required
- `HOLD` - Shipment on hold
- `RELS` - Shipment released

**Transport Events (Vessel/Voyage):**
- `ARRI` - Vessel arrived at port
- `DEPA` - Vessel departed from port
- `OMIT` - Port omitted from voyage
- `CANC` - Transport cancelled

---

## Appendix C: Glossary

**AIS (Automatic Identification System):** Maritime tracking system using transponders on vessels to broadcast position, course, and speed.

**B/L (Bill of Lading):** Legal document between shipper and carrier detailing the type, quantity, and destination of goods being carried.

**Booking Number:** Carrier-assigned reference number for a shipment reservation.

**Container Number:** Unique identifier for a shipping container (format: 4 letters + 7 digits).

**DCSA (Digital Container Shipping Association):** Neutral, non-profit alliance of ocean carriers working to digitalize and standardize the container shipping industry.

**ETA (Estimated Time of Arrival):** Predicted arrival time at destination.

**ATD (Actual Time of Departure):** Actual departure time from origin.

**ATA (Actual Time of Arrival):** Actual arrival time at destination.

**Demurrage:** Charges incurred when containers are not picked up from the terminal within the allowed free time.

**Last Free Day:** Final day to pick up a container before demurrage charges begin.

**SCAC (Standard Carrier Alpha Code):** Unique 2-4 letter code identifying transportation companies.

**TEU (Twenty-foot Equivalent Unit):** Standard unit for measuring container capacity.

**Transshipment:** Transfer of containers from one vessel to another at an intermediate port.

**UN/LOCODE:** United Nations Code for Trade and Transport Locations (standardized port codes).

**Webhook:** HTTP callback that occurs when something happens; a way for an app to provide real-time information to other applications.

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-01 | Research Team | Initial comprehensive research report for Phase 6 Carrier Integrations |

---

**END OF REPORT**
