# Pricing Policy

Status: **working product policy for the `feature/new_design` relaunch**.

This document is the source of truth for pricing decisions until they are deliberately revised. The public landing page should derive its pricing copy from this policy instead of inventing independent prices in HTML.

## 1. Pricing principles

The product must separate four different things that were previously mixed together:

1. **Platform usage** — 3D viewer, AR delivery, hosting, links, QR and embedding.
2. **3D content production** — creation or preparation of customer models.
3. **Product configuration** — materials, colors, variants, parts and interactive product logic.
4. **Custom integration/development** — ecommerce, catalog, ERP/PIM/CRM, API and bespoke XR scenarios.

Infrastructure cost is low enough that pricing should be based primarily on customer value and simplicity, not on raw storage or CDN cost.

The customer should never be punished for successful adoption with an unexpectedly unlimited usage bill. Usage-based billing therefore needs a predictable monthly cap.

## 2. Product ladder

The intended commercial product ladder is:

**Viewer → AR → Configurator → Commerce → Enterprise**

- **Viewer** — interactive 3D product presentation.
- **AR** — place/view the product in the customer's space without installing an app.
- **Configurator** — change materials, colors, dimensions, visible parts and supported product variants.
- **Commerce** — configuration-aware price, lead/order/cart handoff and commercial analytics.
- **Enterprise** — API, bulk catalog workflows, PIM/ERP/CRM integration, white-label, SLA and custom deployment requirements.

Not every level needs to exist as a separate public tariff immediately. This ladder defines product evolution and upsell boundaries.

## 3. Launch tariffs

### Start — 0 ₽ / month

For trying the product with minimal commitment.

Includes:

- 3D Viewer;
- AR "view in your space";
- public share link;
- QR code;
- iframe/embed;
- customer's own supported 3D models;
- basic scene configuration;
- up to **500 billable views per month**.

The purpose of Start is activation and product validation, not monetization.

### AR Commerce — 990 ₽ / month

For small businesses actively embedding 3D/AR into product pages.

Includes everything in Start plus:

- full viewer/scene configuration available in the current product;
- higher usage allowance;
- up to **10,000 billable views per month**;
- standard support.

### Business — 2,990 ₽ / month

For stores and catalogs with meaningful traffic.

Includes everything in AR Commerce plus:

- up to **50,000 billable views per month**;
- white-label / reduced platform branding where technically supported;
- priority support;
- business-oriented embedding/integration options as they become available.

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

## 4. Pay-as-you-go option

A customer that does not want a subscription may use the platform on a usage basis.

Working launch price:

**0.15 ₽ per billable 3D/AR view**

Rules:

- usage billing must have a predictable monthly cap;
- once usage reaches the economically appropriate subscription level, the customer should not continue accumulating an unlimited bill;
- the exact automatic cap/upgrade mechanics may be implemented later, but the commercial principle is mandatory;
- internal page reloads, failed model loads, bots and obvious technical retries must not be intentionally counted as meaningful customer views.

The original **7 ₽ per view** pricing is retired.

## 5. 3D content services

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
- preparation for mobile/AR use;
- fixing material or hierarchy issues needed by the viewer.

Working price: **from 1,000 ₽ per model**.

### 3D model creation

Working price: **from 3,000 ₽ per model**.

The final price depends on complexity and source material. Complex products must be quoted separately rather than forced into the minimum price.

## 6. Configurator services

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

## 7. Integration and custom development

The following work is quoted separately:

- ecommerce integration;
- catalog synchronization;
- Bitrix / WooCommerce / Shopify / OpenCart / custom storefront integration;
- PIM / ERP / CRM integration;
- custom APIs;
- bespoke XR behavior;
- non-standard configurators;
- special deployment/security requirements.

Do not hide software-development work inside a low monthly subscription.

## 8. Public pricing presentation

The landing page should communicate the offer in this order:

1. **Already have a 3D model?** Upload it and start with the platform.
2. **No model?** We can create one from **3,000 ₽**.
3. **Model needs preparation?** Optimization from **1,000 ₽**.
4. **Need materials/variants/configuration?** Configurator from **15,000 ₽**.
5. **Need integration or enterprise workflows?** Request a quote.

Avoid selling vague "XR innovation". Sell concrete outcomes:

- view the product in 3D;
- place it in the customer's space;
- embed it into a product page;
- customize the product when required.

## 9. Pricing constraints

- Do not reintroduce uncapped 7 ₽/view billing.
- Do not bundle manual 3D production into every subscription by default.
- Do not promise unlimited custom development inside Business/Enterprise subscriptions.
- Do not add arbitrary plan differences only to make a pricing table look larger.
- Plan boundaries should correspond to real customer value or real operating cost.
- Pricing numbers are commercial configuration, not domain constants: when implementation begins, they must not be duplicated as unexplained hardcoded values across the frontend/backend.

## 10. Open questions before public launch

These values are intentionally left for validation rather than invented now:

- exact definition of a billable view/session;
- final traffic limits and overage/cap mechanics;
- maximum supported model size per plan;
- model/catalog limits, if any;
- annual-payment discount;
- VAT/tax presentation;
- exact white-label/domain limits;
- whether Start remains permanently free or becomes a time-limited trial after validation.

These questions should be resolved using actual infrastructure measurements and first-customer feedback rather than competitor imitation alone.
