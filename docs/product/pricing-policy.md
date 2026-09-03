# Pricing Policy

Status: **working product policy for the `feature/ux-and-text-fix` relaunch**.

This document is the source of truth for pricing decisions until they are deliberately revised. The public landing page should derive its pricing copy from this policy instead of inventing independent prices in HTML.

## 1. Pricing principles

The product must separate four different things that were previously mixed together:

1. **Platform usage** — 3D viewer, AR/XR delivery, hosting, links, QR and embedding.
2. **3D content production** — creation or preparation of customer models.
3. **Product configuration** — materials, colors, variants, parts and interactive product logic.
4. **Custom integration/development** — ecommerce, catalog, ERP/PIM/CRM, API and bespoke XR scenarios.

Infrastructure cost is low enough that pricing should be based primarily on customer value and simplicity, not on raw storage or CDN cost.

The customer should never be punished for successful adoption with an unexpectedly unlimited usage bill. Usage-based billing therefore needs a predictable monthly cap.

The **3D Viewer is a baseline capability available on every tariff**. It is not treated as the premium AR/XR value layer and should not be artificially restricted between plans. It is useful both to customers and internally for previewing and validating models before AR/XR use.

## 2. Product ladder

The intended commercial product ladder is:

**3D Viewer → AR → XR Room → Configurator → Commerce → Enterprise**

- **3D Viewer** — interactive 3D product presentation and model preview. Baseline capability on all plans.
- **AR** — place/view one product in the customer's real space without installing an app.
- **XR Room** — work with multiple products in one spatial scene: place, remove, move, rotate and scale products; save the room state in the platform; reopen the same room from a link/QR on another device while remaining in the same physical room; build a product composition from the merchant's catalog.
- **Configurator** — change materials, colors, dimensions, visible parts and supported product variants.
- **Commerce** — standard handoff of selected products/configuration into the merchant's shopping flow plus commercial analytics.
- **Enterprise** — API, bulk catalog workflows, PIM/ERP/CRM integration, advanced white-label, SLA and custom deployment requirements.

XR room persistence does **not** currently promise that a spatial room can be sent to a person in another physical location and be reconstructed there with the same real-world alignment. Cross-device continuation is intended for the same physical room/spatial context.

Not every level needs to exist as a separate public tariff immediately. This ladder defines product evolution and upsell boundaries.

## 3. Analytics product concept

Analytics is split by customer question rather than by an arbitrary number of charts.

### Start — billing transparency

Start does **not** include product analytics as a paid feature. It only exposes the information needed to verify usage-based billing:

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

Analytics should be implemented as one shared event stream rather than separate tracking systems per tariff. The platform may collect the technically and legally permitted events needed for later aggregation, while the tariff controls which reports and aggregations the merchant can access.

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

## 4. Launch tariffs

### Start — 0 ₽ / month + AR usage

For companies that already have supported 3D models and want to start using AR with no subscription and no fixed monthly commitment.

Commercial purpose:

- make the first adoption decision almost risk-free for the customer;
- provide a low-friction migration path for companies already paying another AR provider;
- monetize actual AR usage from the first meaningful customer session;
- create a natural upgrade path to Pro when usage grows or the merchant needs XR and engagement analytics.

Pricing:

- **0 ₽ monthly subscription fee**;
- **0.15 ₽ per billable AR session**;
- no free 500-view allowance;
- no AR usage means no platform usage charge;
- usage billing must have a predictable monthly cap so a customer cannot accumulate an unexpectedly unlimited bill.

Includes:

- 3D Viewer;
- AR "view in your space" for an individual product;
- public share link;
- QR code;
- iframe/embed;
- customer's own supported 3D models;
- basic scene configuration;
- standard platform branding;
- billing dashboard with AR session count and accrued usage charge.

Does **not** include:

- multi-product XR room experience;
- XR room saving/composition workflow;
- engagement analytics;
- commerce analytics.

Not included in Start and quoted separately:

- model creation;
- model repair/optimization beyond the supported self-service path;
- product configurators;
- custom ecommerce/catalog integrations;
- bespoke development.

Start is both an acquisition and monetization tariff: small customers generate AR usage revenue without a subscription, while customers with growing traffic or a need for XR should eventually find Pro economically and functionally preferable.

A billable AR session is not the same as a raw HTTP request or page reload. The product must avoid charging for failed model loads, bots, obvious technical retries and duplicate activity inside the same customer session. The exact session window and deduplication rules are implementation details still to be validated.

### Pro — 990 ₽ / month

For merchants that want to go beyond trying one isolated product in AR and let customers **build a room from several products in the merchant's catalog**, while also understanding how buyers interact with that experience.

The core value of Pro is:

> **XR Room + engagement analytics.**

This is not merely a traffic-discount version of Start. A merchant may rationally choose Pro even at low traffic because XR Room itself adds product value.

#### Pricing

- **990 ₽ / month**;
- up to **10,000 billable AR/XR sessions per month included**;
- overage: **0.10 ₽ per billable AR/XR session above the included allowance**;
- usage must still have a predictable cap / upgrade path rather than an unlimited surprise bill.

#### Includes

Everything in Start plus:

- **XR Room multi-product experience**;
- place several merchant products in one physical room/spatial scene;
- add and remove products from the composition;
- move, rotate and scale placed products;
- save the XR room state in the platform;
- reopen/continue the saved room through a generated link or QR on another device **in the same physical room/spatial context**;
- build a composition from selected products;
- convert the current composition into a selected product/SKU list suitable for a precheck/selection step;
- standard 3D/AR/XR scene configuration supported by the product;
- Pro engagement analytics defined in section 3;
- standard support.

The selected product/SKU list is deliberately part of Pro because it completes the room-planning experience. Actual merchant cart, checkout, purchase handoff and revenue attribution remain Business concerns.

#### Pro analytics value

The merchant should be able to answer questions such as:

- how many customers use AR versus XR Room;
- how many AR users proceed into XR;
- which products are viewed/placed most often;
- how long customers spend interacting with AR/XR;
- how many products customers place in a room on average;
- whether model delivery/loading is succeeding reliably;
- how engagement changes over time.

Pro should **not** expose Business-only commercial conclusions such as purchase conversion, revenue attribution, UTM/source attribution or reliable "AR increased sales by X%" claims without the necessary commerce integration.

#### Why customers upgrade from Start

There are two independent upgrade reasons:

1. **Economics:** as Start usage grows, the fixed Pro subscription becomes competitive with usage-only billing.
2. **Product value:** Pro unlocks multi-product XR Room, room persistence/continuation and engagement analytics even when traffic alone would not justify the subscription.

#### Explicit Pro boundaries

Pro does **not** promise:

- that a saved spatial room can be sent to another person in another location and reopen with the same real-world alignment;
- cart/checkout/purchase integration by default;
- revenue attribution or commerce funnel analytics;
- deep configurator analytics;
- analytics CSV/API export;
- advanced white-label;
- priority/SLA support;
- bespoke scene/XR behavior beyond the standard product.

Public tariff message should emphasize:

> **Pro — соберите комнату, а не просто примерьте один товар.** Размещайте несколько товаров в пространстве, сохраняйте композицию и смотрите, что действительно интересно покупателям.

`Pro` is the approved working tariff name. Do not call this tariff `AR Commerce` unless it actually includes commerce/cart/order functionality.

### Business — 2,990 ₽ / month

For merchants that want to connect the spatial product experience directly to the shopping flow and understand how AR/XR contributes to commercial outcomes.

The core value of Business is:

> **XR → selected products → cart + commerce analytics.**

Business is not merely Pro with a larger traffic allowance. It adds the standard commerce handoff and the analytics needed to understand what happens after spatial interaction.

#### Pricing

- **2,990 ₽ / month**;
- up to **50,000 billable AR/XR sessions per month included**;
- overage: **0.05 ₽ per billable AR/XR session above the included allowance**;
- usage still requires a predictable cap / Enterprise upgrade path rather than an unlimited surprise bill.

#### Includes

Everything in Pro plus:

- standard **precheck → merchant cart** flow;
- standard JS/API contract for handing selected SKU/variant/configuration data to the merchant's storefront;
- standard callbacks/events needed to observe cart/checkout/purchase steps when the merchant can provide them;
- Business commerce analytics defined in section 3;
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

If the merchant needs Art Vision Tech to manually adapt or implement the integration for a specific storefront, CMS, legacy system or custom checkout, that engineering work is quoted separately.

#### Business analytics value

The merchant should be able to answer questions such as:

- which traffic sources lead to AR/XR interaction;
- which products move from XR into the selected list/cart;
- where customers leave the funnel;
- which SKU and configurations convert best;
- which products are commonly combined in the same room;
- how much observed revenue is associated with AR/XR-assisted journeys;
- how commerce performance changes over time.

Business may show revenue or purchase conversion only when the merchant integration provides reliable corresponding events. The platform must not invent attribution from incomplete data.

#### Why customers upgrade from Pro

There are two independent upgrade reasons:

1. **Economics:** around higher traffic volumes, Business becomes preferable to accumulating Pro overage.
2. **Commercial value:** the merchant wants the XR composition to continue into cart/checkout and wants to measure commercial outcomes rather than engagement alone.

#### Explicit Business boundaries

Business includes the standard commerce integration contract, but does **not** include unlimited custom engineering.

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

Public tariff message should emphasize:

> **Business — превратите XR в измеримый путь к продаже.** Передавайте выбранные товары в корзину и смотрите, какие AR/XR-сценарии, товары и комбинации реально доходят до покупки.

## 5. Enterprise — custom

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

## 6. Start usage billing rules

Start is the platform's usage-based entry tariff. A separate generic pay-as-you-go tariff is not needed at launch.

Launch usage price:

**0.15 ₽ per billable AR session**

Rules:

- 3D Viewer usage itself is not the billable Start event;
- billing starts from the first billable AR session;
- there is no recurring subscription charge on Start;
- usage billing must have a predictable monthly cap;
- once usage reaches the economically appropriate Pro level, the customer should be encouraged to move to Pro instead of continuing to accumulate an unlimited usage bill;
- the exact automatic cap/upgrade mechanics may be implemented later, but the commercial principle is mandatory;
- internal page reloads, failed model loads, bots, obvious technical retries and duplicate activity inside one session must not be intentionally counted as separate billable sessions.

The original **7 ₽ per view** pricing is retired.

## 7. 3D content services

3D production is **not included implicitly in SaaS subscription pricing**.

### Customer already has a production-ready model

No model creation fee.

The customer pays only for the platform according to the selected tariff / usage model.

### Model preparation / optimization

Examples:

- web optimization;
- polygon reduction;
- texture optimization;
- conversion to supported formats;
- preparation for mobile/AR/XR use;
- fixing material or hierarchy issues needed by the viewer.

Working price: **from 1,000 ₽ per model**.

### 3D model creation

Working price: **from 3,000 ₽ per model**.

The final price depends on complexity and source material. Complex products must be quoted separately rather than forced into the minimum price.

## 8. Configurator services

A product configurator is a separate commercial value layer, not a free side effect of hosting a model.

Possible configuration capabilities include:

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

## 9. Integration and custom development

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

## 10. Public pricing presentation

The landing page should communicate the product hierarchy clearly:

1. **3D Viewer is available on every tariff.**
2. **Start:** 0 ₽/month, individual-product AR, pay for actual AR usage.
3. **Pro:** 990 ₽/month, multi-product XR Room + room persistence/continuation + engagement analytics + included usage.
4. **Business:** 2,990 ₽/month, standard XR-to-cart handoff + commerce analytics + higher included usage.
5. **Already have a 3D model?** Use it without a model creation fee.
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
- understand commercial impact with Business analytics;
- embed the experience into a product page;
- customize the product when required.

## 11. Pricing constraints

- Do not reintroduce uncapped 7 ₽/view billing.
- Do not bill Start for ordinary 3D Viewer preview as if it were an AR session.
- Do not put XR Room into Start: XR is a deliberate Pro value boundary.
- Do not expose engagement analytics on Start beyond the information needed for billing transparency.
- Do not present XR room sharing between unrelated physical locations as a supported Pro capability.
- Do not claim commerce conversion/revenue analytics without the integration required to observe those events reliably.
- Do not charge an extra platform fee merely to expose the standard Business JS/API commerce handoff contract.
- Do not include arbitrary custom ecommerce engineering in the Business subscription.
- Do not bundle manual 3D production into every subscription by default.
- Do not promise unlimited custom development inside Business/Enterprise subscriptions.
- Do not add arbitrary plan differences only to make a pricing table look larger.
- Plan boundaries should correspond to real customer value or real operating cost.
- Pricing numbers are commercial configuration, not domain constants: when implementation begins, they must not be duplicated as unexplained hardcoded values across the frontend/backend.

## 12. Open questions before public launch

These values are intentionally left for validation rather than invented now:

- exact definition and duration of a billable AR session on Start;
- exact definition/deduplication of billable AR/XR sessions on Pro/Business;
- final Start usage cap and automatic upgrade mechanics;
- final Pro overage/cap mechanics;
- final Business cap / Enterprise upgrade threshold;
- XR room persistence format, retention period and cross-device resume mechanics;
- exact analytics event schema and retention policy;
- exact standard Business JS/API commerce contract and event acknowledgement semantics;
- maximum supported model size per plan;
- model/catalog limits, if any;
- annual-payment discount;
- VAT/tax presentation;
- exact reduced-branding versus Enterprise white-label/domain boundary;
- whether Start's **0 ₽ monthly fee** remains permanent after validation.

These questions should be resolved using actual infrastructure measurements and first-customer feedback rather than competitor imitation alone.
