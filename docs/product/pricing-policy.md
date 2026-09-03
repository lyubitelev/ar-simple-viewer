# Pricing Policy

Status: **working product policy for the `feature/ux-and-text-fix` relaunch**.

This document is the source of truth for pricing decisions until they are deliberately revised. Public landing-page pricing must derive from this policy rather than inventing independent prices in HTML.

## 1. Pricing principles

The product must separate four different commercial layers:

1. **Platform usage** — 3D Viewer, AR/XR delivery, hosting, links, QR and embedding.
2. **3D content production** — creation, repair or preparation of customer models.
3. **Product configuration** — materials, colors, variants, parts and interactive product logic.
4. **Custom integration/development** — ecommerce, catalog, ERP/PIM/CRM, bespoke API and non-standard XR scenarios.

The **3D Viewer is a baseline capability available on every tariff**. It is useful both to customers and internally for previewing and validating models before AR/XR use and is not treated as the premium spatial value layer.

Pricing must remain simple for the customer, but it must not depend on an assumption that every model or XR session will be cheap to deliver.

### Infrastructure-margin guardrail

Tariff prices, included usage and overage prices must be designed so that the platform is not structurally loss-making when a customer legitimately uses the full allowance.

Working internal rule:

- target at least **50–60% infrastructure gross margin** under a deliberately heavy but still supported delivery profile;
- use **50 MB of delivered traffic per billable session** as the current conservative planning benchmark until real telemetry replaces it;
- do not rely on "the average model will probably be small" as a pricing assumption;
- when cloud prices, real traffic profiles or architecture change materially, recalculate tariff economics before changing public allowances;
- partner discounts, grants, CDN discounts and free tiers are upside and must not be required for the basic tariff to avoid negative unit economics.

This margin rule concerns infrastructure cost only. It does not mean human development, support, tax, acquiring, sales or 3D-production costs are free; those are separate business costs.

The customer should also never accumulate an unexpectedly unlimited usage bill. Usage billing therefore needs a predictable monthly cap, upgrade path or explicit limit policy.

## 2. Product ladder

The intended commercial product ladder is:

**3D Viewer → AR → XR Room → Configurator → Commerce → Enterprise**

- **3D Viewer** — interactive 3D product presentation and model preview. Baseline capability on all plans.
- **AR** — place/view one product in the customer's real space without installing an app.
- **XR Room** — work with multiple products in one spatial scene: place, remove, move, rotate and scale products; save room state; reopen it through a link/QR on another device while remaining in the same physical room; build a composition from the merchant's catalog.
- **Configurator** — change materials, colors, dimensions, visible parts and supported product variants.
- **Commerce** — standard handoff of selected products/configuration into the merchant's shopping flow plus commercial analytics.
- **Enterprise** — API, bulk catalog workflows, PIM/ERP/CRM integration, advanced white-label, SLA and custom deployment requirements.

XR room persistence does **not** currently promise that a spatial room can be sent to a person in another physical location and be reconstructed there with the same real-world alignment. Cross-device continuation is intended for the same physical room/spatial context.

## 3. Model validation and delivery economics

Production AR/XR delivery must not accept arbitrary customer assets without technical validation.

A dedicated model-validation pipeline is a required platform capability before unrestricted self-service production use.

### Validation goals

Before a model is accepted for production delivery, the platform should validate or derive at least:

- supported file/container format;
- total asset/file size;
- geometry and polygon/triangle complexity;
- texture count, dimensions, formats and aggregate texture weight;
- material compatibility;
- dimensions, units and real-world scale;
- unsupported or excessively expensive model features;
- mobile/WebGL/AR/XR compatibility;
- estimated memory/load-time risk;
- suitability for the platform's current delivery budget.

The exact thresholds are implementation configuration, not permanent pricing-policy constants.

### Validation outcomes

A submitted model should resolve to an explicit state such as:

- **accepted** — production-ready within the supported budget;
- **accepted with warning** — usable but close to a technical threshold;
- **optimization required** — must be reduced/repacked/retextured before production delivery;
- **rejected** — unsupported or unsafe for the current delivery path.

A model that would make normal sessions economically or technically unreasonable must not silently enter production simply because the upload technically succeeded.

### Optimization

The platform should use appropriate techniques where supported, including geometry compression/optimization, texture optimization, caching and lazy loading. Multi-product XR must avoid downloading every catalog model eagerly when only a subset is needed.

Customer models requiring manual repair or optimization beyond the supported self-service path are a separate paid content service.

### Cost telemetry

The platform should eventually track enough information to calculate actual unit economics by tenant and tariff, including metrics such as:

- billable sessions;
- bytes delivered per session;
- average and percentile delivery size;
- model-load success/failure;
- repeated/cached delivery where observable;
- infrastructure cost per billable session;
- infrastructure gross margin by tariff/customer.

`bytesDelivered / billableSession` is an important operational metric and should be treated as part of pricing observability, not merely low-level infrastructure telemetry.

### Object Storage and CDN

CDN is an optimization decision, not an assumption embedded into tariff economics.

The platform may deliver directly from Object Storage at lower volumes and introduce/use CDN when actual traffic, performance and current provider pricing make it beneficial. Pricing must remain viable without depending on a particular temporary free tier or partner discount.

## 4. Analytics product concept

Analytics is split by the customer's question rather than by an arbitrary number of charts.

### Start — billing transparency

Start does **not** include product analytics as a paid feature. It exposes only the information needed to verify usage-based billing:

- billable AR sessions in the current billing period;
- current accrued platform charge;
- configured monthly spending cap / billing limit when implemented.

This is a **billing dashboard**, not engagement analytics.

### Pro — engagement analytics

Pro answers:

> How do customers interact with our 3D/AR/XR products and which products attract attention?

Planned Pro analytics:

- AR sessions;
- XR room sessions;
- AR → XR transition/adoption rate where the denominator is technically well-defined;
- popular products / SKU by interaction;
- top products by AR use;
- top products by XR placement;
- average interaction/session duration;
- average number of products placed in an XR room/session;
- activity dynamics by day/week and selected period;
- successful and failed model loads / technical delivery quality.

Pro analytics is about **engagement with the spatial product experience**, not revenue attribution.

### Business — commerce analytics

Business answers:

> What happens after AR/XR and how does spatial interaction influence shopping behaviour and sales?

Business analytics includes Pro analytics plus, where the required ecommerce events can be observed reliably:

- traffic source / referrer / UTM attribution;
- device/browser/channel breakdowns where useful;
- funnel steps such as product → 3D → AR/XR → selected products → cart → checkout → purchase;
- cart, checkout and purchase events;
- conversion by SKU;
- revenue / order-value attribution when the merchant provides reliable purchase data;
- AR/XR-assisted conversion versus non-AR/XR journeys when the comparison can be measured correctly;
- products commonly placed together in one XR room / product affinity;
- products placed and then removed from a room;
- configurator selections such as materials, colors, options and variants;
- configuration-to-cart / configuration-to-order behaviour;
- CSV export of commercial analytics data.

Commerce metrics must not be claimed when there is no reliable integration that can observe the corresponding cart/order/purchase event.

### Shared event architecture

Analytics should be implemented as one shared event stream rather than separate tracking systems per tariff. The tariff controls which reports and aggregations the merchant can access.

Potential event vocabulary includes:

- `viewer_opened`;
- `model_loaded`;
- `model_load_failed`;
- `ar_requested`;
- `ar_started`;
- `ar_ended`;
- `xr_started`;
- `xr_ended`;
- `model_placed`;
- `model_moved`;
- `model_rotated`;
- `model_scaled`;
- `model_removed`;
- `room_saved`;
- `room_reopened`;
- `product_selected`;
- `precheck_opened`;
- `add_to_cart`;
- `checkout_started`;
- `purchase`.

The exact analytics schema, privacy rules, retention and deduplication mechanics belong to implementation design and must be specified before development.

## 5. Launch tariffs

### Start — 0 ₽ / month + AR usage

For companies that already have supported 3D models and want to start using AR with no subscription and no fixed monthly commitment.

#### Pricing

- **0 ₽ monthly subscription fee**;
- **0.30 ₽ per billable AR session**;
- no free session allowance;
- no AR usage means no platform usage charge;
- usage requires a predictable monthly cap / upgrade mechanism.

#### Includes

- 3D Viewer;
- single-product AR "view in your space";
- public share link;
- QR code;
- iframe/embed;
- customer's own supported and validated 3D models;
- basic scene configuration;
- standard platform branding;
- billing dashboard with AR session count and accrued usage charge.

Does **not** include:

- multi-product XR Room;
- XR room saving/composition workflow;
- engagement analytics;
- commerce analytics.

Not included and quoted separately:

- model creation;
- model repair/optimization beyond the supported self-service path;
- product configurators;
- custom ecommerce/catalog integrations;
- bespoke development.

Start is both an acquisition and monetization tariff. At approximately **8,300 billable AR sessions**, pure Start usage approaches the Pro monthly price; Pro may also be chosen earlier for its XR and analytics value.

### Pro — 2,490 ₽ / month

For merchants that want customers to **build a room from several products in the merchant's catalog** and want engagement analytics around that experience.

Core value:

> **XR Room + engagement analytics.**

#### Pricing

- **2,490 ₽ / month**;
- up to **10,000 billable AR/XR sessions per month included**;
- overage: **0.20 ₽ per billable AR/XR session above the included allowance**;
- usage requires a predictable cap / Business upgrade path.

#### Includes

Everything in Start plus:

- **XR Room multi-product experience**;
- place several merchant products in one physical room/spatial scene;
- add and remove products from the composition;
- move, rotate and scale placed products;
- save XR room state in the platform;
- reopen/continue the saved room through a generated link or QR on another device **in the same physical room/spatial context**;
- build a composition from selected products;
- convert the current composition into a selected product/SKU list suitable for a precheck/selection step;
- standard 3D/AR/XR scene configuration supported by the product;
- Pro engagement analytics defined in section 4;
- standard support.

The selected product/SKU list is part of Pro because it completes the room-planning experience. Actual merchant cart, checkout, purchase handoff and revenue attribution remain Business concerns.

#### Why customers upgrade from Start

There are two independent upgrade reasons:

1. **Economics:** as Start usage approaches the Pro subscription, fixed pricing becomes preferable.
2. **Product value:** Pro unlocks multi-product XR Room, room persistence/continuation and engagement analytics even when traffic alone would not justify the subscription.

#### Explicit Pro boundaries

Pro does **not** promise:

- spatial-room reconstruction for another person in another physical location;
- cart/checkout/purchase integration by default;
- revenue attribution or commerce funnel analytics;
- deep configurator analytics;
- analytics CSV/API export;
- advanced white-label;
- priority/SLA support;
- bespoke scene/XR behavior beyond the standard product.

Public tariff message:

> **Pro — соберите комнату, а не просто примерьте один товар.** Размещайте несколько товаров в пространстве, сохраняйте композицию и смотрите, что действительно интересно покупателям.

### Business — 9,990 ₽ / month

For merchants that want to connect the spatial product experience directly to the shopping flow and understand how AR/XR contributes to commercial outcomes.

Core value:

> **XR → selected products → cart + commerce analytics.**

#### Pricing

- **9,990 ₽ / month**;
- up to **50,000 billable AR/XR sessions per month included**;
- overage: **0.20 ₽ per billable AR/XR session above the included allowance**;
- usage requires a predictable cap / Enterprise upgrade path.

With the current Pro overage, Business becomes economically competitive at roughly **47,500 billable AR/XR sessions**, while commerce functionality can justify the upgrade much earlier.

#### Includes

Everything in Pro plus:

- standard **precheck → merchant cart** flow;
- standard JS/API contract for handing selected SKU/variant/configuration data to the merchant's storefront;
- standard callbacks/events needed to observe cart/checkout/purchase steps when the merchant can provide them;
- Business commerce analytics defined in section 4;
- traffic source/referrer/UTM attribution;
- commerce funnel reporting;
- conversion by SKU;
- revenue attribution when reliable purchase/order-value data is available;
- product-affinity / products commonly placed together in XR;
- configurator analytics where the configurator exposes the required events;
- CSV export of commercial analytics;
- reduced/neutral platform branding where technically supported;
- priority support.

The **standard JS/API commerce contract is part of the Business subscription**. A merchant can integrate against that documented contract without paying a separate platform fee for the contract itself.

If Art Vision Tech must manually adapt or implement integration for a specific storefront, CMS, legacy system or custom checkout, that engineering work is quoted separately.

#### Explicit Business boundaries

Quoted separately or moved to Enterprise when appropriate:

- manual/custom integration for a specific ecommerce implementation;
- custom adapters for legacy storefronts/CMS/checkout logic;
- PIM / ERP / CRM integration;
- bespoke APIs designed around one customer's internal systems;
- custom domain / advanced white-label requirements;
- private or dedicated deployment;
- dedicated SLA;
- bespoke security/infrastructure requirements;
- non-standard XR/commerce behavior outside the supported platform contract.

Public tariff message:

> **Business — превратите XR в измеримый путь к продаже.** Передавайте выбранные товары в корзину и смотрите, какие AR/XR-сценарии, товары и комбинации реально доходят до покупки.

## 6. Enterprise — custom

For requirements that should not distort self-service SaaS pricing.

Typical scope:

- very high traffic;
- dedicated SLA/support;
- bespoke API/integration requirements beyond the standard Business commerce contract;
- bulk catalog operations;
- PIM / ERP / CRM integration;
- custom domains and advanced white-label;
- private or dedicated deployment;
- bespoke security/infrastructure requirements.

Enterprise pricing is quoted individually.

## 7. Billing/session rules

A billable session is not the same as a raw HTTP request, page load or model download.

### Start

- 3D Viewer preview itself is not billable;
- billing begins with a valid billable AR session;
- internal page reloads, failed loads, bots, obvious retries and duplicate activity inside one session must not intentionally become separate billable sessions.

### Pro / Business

- included usage covers valid billable AR/XR sessions according to the common session definition;
- the exact deduplication/session-window rules must be implementation-defined and consistently applied;
- failed delivery must not be treated as successful paid spatial usage merely because network traffic occurred.

Billing-session semantics and infrastructure-cost telemetry are related but different: a customer is billed according to product/session rules, while the platform separately measures actual bytes and cloud cost to protect unit economics.

The original **7 ₽ per view** pricing is retired.

## 8. 3D content services

3D production is **not included implicitly in SaaS subscription pricing**.

### Customer already has a production-ready model

No model creation fee, provided the model passes platform validation.

The customer pays only for the platform according to the selected tariff / usage model.

### Model preparation / optimization

Examples:

- web optimization;
- polygon reduction;
- texture optimization;
- conversion to supported formats;
- preparation for mobile/AR/XR use;
- fixing material or hierarchy issues needed by the viewer;
- bringing an asset back inside the platform's supported technical/delivery budget.

Working price: **from 1,000 ₽ per model**.

### 3D model creation

Working price: **from 3,000 ₽ per model**.

The final price depends on complexity and source material. Complex products must be quoted separately rather than forced into the minimum price.

## 9. Configurator services

A product configurator is a separate commercial value layer, not a free side effect of hosting a model.

Possible capabilities include:

- material replacement;
- color/texture variants;
- visibility of model parts;
- geometry/variant selection;
- dimensions/options;
- product rules and compatible combinations;
- configuration-aware pricing and order data.

Working custom-project starting price: **from 15,000 ₽**.

This is a minimum entry price, not a promise that every configurator can be built for 15,000 ₽.

Reusable generic configurator capabilities may later become part of higher SaaS plans.

## 10. Integration and custom development

Business includes a **standard documented commerce handoff contract** for selected products/configurations and standard commerce events. Using that supported contract is part of the tariff.

The following engineering work is quoted separately:

- manual ecommerce integration performed by Art Vision Tech;
- custom storefront/CMS/checkout adapters;
- catalog synchronization outside the standard supported path;
- Bitrix / WooCommerce / Shopify / OpenCart / custom storefront work when custom implementation is required;
- PIM / ERP / CRM integration;
- bespoke APIs;
- bespoke XR behavior outside the standard product;
- non-standard configurators;
- special deployment/security requirements.

Do not hide software-development work inside a low monthly subscription.

## 11. Public pricing presentation

The landing page should communicate the hierarchy clearly:

1. **3D Viewer is available on every tariff.**
2. **Start:** 0 ₽/month + **0.30 ₽ per billable AR session**; individual-product AR.
3. **Pro:** **2,490 ₽/month**; 10,000 AR/XR sessions included; multi-product XR Room + persistence + engagement analytics; **0.20 ₽ overage**.
4. **Business:** **9,990 ₽/month**; 50,000 AR/XR sessions included; standard XR-to-cart handoff + commerce analytics; **0.20 ₽ overage**.
5. **Already have a 3D model?** Use it without a model creation fee after technical validation.
6. **No model?** We can create one from **3,000 ₽**.
7. **Model needs preparation?** Optimization from **1,000 ₽**.
8. **Need materials/variants/configuration?** Configurator from **15,000 ₽**.
9. **Need custom integration or enterprise workflows?** Request a quote.

Avoid selling vague "XR innovation". Sell concrete outcomes:

- inspect a product in 3D;
- place one product in the customer's space with AR;
- combine several catalog products in the customer's room with Pro/XR;
- save and continue the same room on another device in the same physical space;
- understand product engagement with Pro analytics;
- pass selected products into the merchant's shopping flow with Business;
- understand commercial impact with Business analytics.

## 12. Pricing constraints

- Do not publish a self-service tariff whose full legitimate usage is expected to produce negative infrastructure gross margin.
- Target at least the current **50–60% infrastructure gross-margin guardrail** under the supported heavy-session planning profile unless pricing is deliberately re-approved.
- Do not use partner discounts, free tiers or temporary cloud promotions as the only reason a tariff remains profitable.
- Do not accept arbitrary heavy models into production without validation/optimization controls.
- Do not reintroduce uncapped 7 ₽/view billing.
- Do not bill Start for ordinary 3D Viewer preview as if it were an AR session.
- Do not put XR Room into Start: XR is a deliberate Pro value boundary.
- Do not expose engagement analytics on Start beyond billing transparency.
- Do not present XR room sharing between unrelated physical locations as a supported Pro capability.
- Do not claim commerce conversion/revenue analytics without the integration required to observe those events reliably.
- Do not charge an extra platform fee merely to expose the standard Business JS/API commerce handoff contract.
- Do not include arbitrary custom ecommerce engineering in the Business subscription.
- Do not bundle manual 3D production into every subscription by default.
- Do not promise unlimited custom development inside Business/Enterprise subscriptions.
- Do not add arbitrary plan differences only to make a pricing table look larger.
- Plan boundaries should correspond to real customer value or real operating cost.
- Pricing numbers, limits and validation thresholds are configuration, not domain constants; do not duplicate unexplained hardcoded values across frontend/backend.

## 13. Open questions before public launch

These values still require validation from implementation measurements and first-customer traffic:

- exact definition and duration of a billable AR session on Start;
- exact definition/deduplication of billable AR/XR sessions on Pro/Business;
- final Start monthly cap / automatic Pro-upgrade mechanics;
- final Pro/Business monthly caps and Enterprise upgrade threshold;
- exact model-validation thresholds for file size, geometry, textures, memory and load time;
- whether validation thresholds vary between single-product AR and multi-product XR;
- final supported delivery-size budget after real-device testing;
- actual `bytesDelivered / billableSession` distributions by tariff;
- Object Storage versus CDN switch criteria based on current provider pricing and observed traffic;
- XR room persistence format, retention period and cross-device resume mechanics;
- exact analytics event schema and retention policy;
- exact standard Business JS/API commerce contract and event acknowledgement semantics;
- maximum catalog/model counts where operationally necessary;
- annual-payment discount;
- VAT/tax presentation;
- exact reduced-branding versus Enterprise white-label/domain boundary;
- whether Start's **0 ₽ monthly fee** remains permanent after validation.

These questions should be resolved using real telemetry and provider economics rather than competitor imitation or optimistic assumptions.