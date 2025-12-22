# Ad Performance Formulas & Logic

This document outlines the mathematical formulas and algorithmic logic used to calculate performance metrics and generate optimization suggestions within the platform.

## Core Metrics

These metrics are calculated for each ad platform (Google, Meta, LinkedIn, TikTok) based on the synchronized raw data.

| Metric | Formula | Description |
| :--- | :--- | :--- |
| **ROAS** | $\frac{\text{Total Revenue}}{\text{Total Spend}}$ | **Return on Ad Spend**: Measures the gross revenue generated for every dollar spent on advertising. |
| **CPC** | $\frac{\text{Total Spend}}{\text{Total Clicks}}$ | **Cost Per Click**: The average amount paid for each click on an advertisement. |
| **CTR** | $\left( \frac{\text{Total Clicks}}{\text{Total Impressions}} \right) \times 100$ | **Click-Through Rate**: The percentage of people who saw the ad and clicked it. |
| **CPA** | $\frac{\text{Total Spend}}{\text{Total Conversions}}$ | **Cost Per Acquisition**: The average cost to acquire a single conversion (lead, sale, etc.). |
| **Conv. Rate** | $\left( \frac{\text{Total Conversions}}{\text{Total Clicks}} \right) \times 100$ | **Conversion Rate**: The percentage of clicks that resulted in a successful conversion. |
| **CPM** | $\left( \frac{\text{Total Spend}}{\text{Total Impressions}} \right) \times 1000$ | **Cost Per Mille**: The cost for every 1,000 impressions (views) of an ad. |

---

## Algorithmic Insight Logic

The platform uses a rule-based engine to identify performance patterns and provide actionable suggestions.

### 1. Efficiency Analysis (ROAS)
*   **High Performance**: If $\text{ROAS} > 4.0$
    *   *Logic*: The campaign is highly profitable.
    *   *Suggestion*: Scale budget by 15-20% to capture more high-value traffic.
*   **Low Efficiency**: If $\text{ROAS} < 1.5$ (and Spend > $100)
    *   *Logic*: The campaign is likely near or below the break-even point.
    *   *Suggestion*: Pause underperforming ad sets and re-evaluate the offer.

### 2. Creative & Relevance Analysis (CPC vs. Conv. Rate)
*   **High Acquisition Cost**: If $\text{CPC} > \$5.00$ AND $\text{Conv. Rate} < 1\%$
    *   *Logic*: You are paying a premium for traffic that isn't converting.
    *   *Suggestion*: Test new ad creatives with stronger calls-to-action to improve click quality.

### 3. Landing Page Friction (Clicks vs. Conv. Rate)
*   **Friction Detected**: If $\text{Clicks} > 500$ AND $\text{Conv. Rate} < 0.5\%$
    *   *Logic*: High volume of traffic is reaching the destination but failing to take action.
    *   *Suggestion*: Audit landing page load speed, mobile responsiveness, and message match.

### 4. Cross-Platform Budget Reallocation
*   **Reallocation Opportunity**: If $\text{ROAS}_{\text{Platform A}} > (\text{ROAS}_{\text{Platform B}} \times 1.5)$
    *   *Logic*: One platform is significantly more efficient than another.
    *   *Suggestion*: Shift 10-15% of the budget from the lower-performing platform to the higher-performing one.

---

## Data Normalization
All data is normalized to a standard format before calculation to ensure consistency across different API providers (Google Ads, Meta Graph API, etc.).

*   **Currency**: All financial values are converted to the workspace's primary currency.
*   **Timeframes**: Metrics are aggregated based on the selected period (7d, 30d, 90d) using the `createdAt` or `date` timestamp from the provider.
