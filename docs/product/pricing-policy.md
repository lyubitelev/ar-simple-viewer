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
- **Commerce** — configuration-aware price, lead/order/cart handoff and commercial analytics.
- **Enterprise** — API, bulk catalog workflows, PIM/ERP/CRM integration, white-label, SLA and custom deployment requirements.

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

Planned Business analytics includes Pro analytics plus, where the required ecommerce integration exists:

- traffic source / referrer / UTM attribution;
- device/browser/channel breakdowns where useful;
- funnel steps such as product → 3D → AR/XR → cart → checkout → purchase;
- cart, checkout and purchase events;
- conversion by SKU;
- AR/XR-assisted conversion versus non-AR/XR journeys when the comparison can be measured correctly;
- products commonly placed together in one XR room;
- products placed and then removed from a room;
- configurator selections such as materials, colors, options and variants;
- configuration-to-cart / configuration-to-order behaviour;
- export of commercial analytics data.

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
- working overage: **0.10 ₽ per billable AR/XR session above the included allowance**;
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

The selected product/SKU list is deliberately part of Pro because it completes the room-planning experience. Actual merchant cart, checkout, purchase handoff and revenue attribution remain Business/Commerce concerns unless explicitly implemented as a separately quoted integration.

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

### Business — 2,990 ₽ / month (working, not yet fully approved)

For stores and catalogs that need to connect spatial product interaction with commercial behaviour.

Current conceptual boundary:

- includes Pro functionality;
- includes commerce analytics defined in section 3;
- higher usage allowance (working value: up to **50,000 billable AR/XR sessions per month**);
- white-label / reduced platform branding where technically supported;
- priority support;
- business-oriented embedding/integration options as they become available.

Business pricing, final traffic allowance, overage and exact feature list must be approved separately before being treated as final.

### Enterprise — custom

For requirements that should not distort self-service SaaS pricing.

Typical scope:

- very high traffic;
- dedicated SLA/support;
- API access;
- bulk catalog operations;
- PIM / ERP / CRM integration;
- custom domains and advanced white-label;
- private or dedicated deployment;
- bespoke security/infrastructure requirements.

Enterprise pricing is quoted individually.

## 5. Start usage billing rules

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

## 6. 3D content services

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

## 7. Configurator services

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

## 8. Integration and custom development

The following work is quoted separately:

- ecommerce integration;
- catalog synchronization;
- Bitrix / WooCommerce / Shopify / OpenCart / custom storefront integration;
- PIM / ERP / CRM integration;
- custom APIs;
- bespoke XR behavior outside the standard product;
- non-standard configurators;
- special deployment/security requirements.

Do not hide software-development work inside a low monthly subscription.

## 9. Public pricing presentation

The landing page should communicate the product hierarchy clearly:

1. **3D Viewer is available on every tariff.**
2. **Start:** 0 ₽/month, individual-product AR, pay for actual AR usage.
3. **Pro:** 990 ₽/month, multi-product XR Room + room persistence/continuation + engagement analytics + included usage.
4. **Business:** commerce analytics and business integration value; exact final package still requires approval.
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
- understand commercial impact with Business analytics;
- embed the experience into a product page;
- customize the product when required.

## 10. Pricing constraints

- Do not reintroduce uncapped 7 ₽/view billing.
- Do not bill Start for ordinary 3D Viewer preview as if it were an AR session.
- Do not put XR Room into Start: XR is a deliberate Pro value boundary.
- Do not expose engagement analytics on Start beyond the information needed for billing transparency.
- Do not present XR room sharing between unrelated physical locations as a supported Pro capability.
- Do not claim commerce conversion/revenue analytics without the integration required to observe those events reliably.
- Do not bundle manual 3D production into every subscription by default.
- Do not promise unlimited custom development inside Business/Enterprise subscriptions.
- Do not add arbitrary plan differences only to make a pricing table look larger.
- Plan boundaries should correspond to real customer value or real operating cost.
- Pricing numbers are commercial configuration, not domain constants: when implementation begins, they must not be duplicated as unexplained hardcoded values across the frontend/backend.

## 11. Open questions before public launch

These values are intentionally left for validation rather than invented now:

- exact definition and duration of a billable AR session on Start;
- exact definition/deduplication of billable AR/XR sessions on Pro;
- final Start usage cap and automatic upgrade mechanics;
- final Pro overage/cap mechanics;
- XR room persistence format, retention period and cross-device resume mechanics;
- final Business traffic allowance, price and overage;
- exact analytics event schema and retention policy;
- maximum supported model size per plan;
- model/catalog limits, if any;
- annual-payment discount;
- VAT/tax presentation;
- exact white-label/domain limits;
- whether Start's **0 ₽ monthly fee** remains permanent after validation.

These questions should be resolved using actual infrastructure measurements and first-customer feedback rather than competitor imitation alone.
