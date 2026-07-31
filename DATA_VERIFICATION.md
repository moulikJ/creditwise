# CreditWise — Data Verification Handoff

Use this to continue verifying card data in a fresh conversation (keeps token budget clean).

## What's already done
- **Systematic age fix applied:** no card has minAge above 21. Indian credit cards have a
  minimum age of 18 (basic/student/entry) or 21 (most others). Maximum age (60–65) is not
  used by the eligibility engine, so only the minimum matters.
- **Provenance fields added** to every card (lib/types.ts):
  - `verified?: boolean` — true once core fields are confirmed against a source
  - `verifiedOn?: string` — ISO date (e.g. "2026-06-27")
  - `officialUrl?: string` — bank's official card page
- **Card detail page** shows "✓ Core data verified on <date>" for verified cards, an
  "indicative" note otherwise, and a "Check latest on official site →" link.

## Cards already verified (core fields confirmed, June 2026)
| Card | minAge | minIncomeAnnual | annualFee | waiver | source |
|------|--------|-----------------|-----------|--------|--------|
| HDFC Regalia Gold | 21 | ₹18,00,000 | ₹2,500 | ₹4,00,000 | hdfcbank.com |
| HDFC Millennia | 21 | ₹4,20,000 (₹35k/mo) | ₹1,000 | ₹1,00,000 | hdfcbank.com |

## How to verify each remaining card (the loop)
For each card in `lib/seed.ts`, search: `"<bank> <card> credit card eligibility age income annual fee 2026"`.
Confirm and correct these **core fields**:
1. `minAge` (18 or 21)
2. `minIncomeAnnual` (convert monthly → annual; salaried figure)
3. `annualFee` and `joiningFee`
4. `annualFeeWaiver` (spend threshold)
5. Headline reward rate(s) in `rewardRules` (sanity check only)
Then set `verified: true, verifiedOn: "<today ISO>", officialUrl: "<bank page>"`.

Prefer official bank pages; aggregators (paisabazaar, bankbazaar, paisawiki) are acceptable
cross-checks. Note bank terms change — re-verify periodically.

## Remaining cards to verify (33)
Cashback SBI, Axis ACE, Kiwi RuPay, SBI SimplyCLICK, HDFC MoneyBack+, Flipkart Axis,
Tata Neu Plus, Tata Neu Infinity, ICICI Rubyx, BPCL SBI Octane, IndianOil HDFC, Scapia,
Axis Atlas, ICICI Sapphiro, SBI PRIME, Axis Magnus, HDFC Infinia, ICICI Emeralde Private,
IDFC FIRST Wealth, AU LIT, HSBC Platinum, OneCard, Amex Membership Rewards, RBL ShopRite,
SC Ultimate, YES Marquee, IndusInd Legend, Airtel Axis, ICICI Coral, Swiggy HDFC,
Federal Celesta, BoB Eterna.

## Expansion target (~20 more popular cards to add)
HDFC Diners Club Black, HDFC Swiggy (have), SBI ELITE, SBI SimplySAVE, ICICI Amazon Pay (have),
Axis MyZone, Axis SELECT, Amex Platinum Travel, Amex Gold Charge, IDFC FIRST Millennia,
IDFC FIRST Power, AU Zenith, IndusInd Tiger, RBL World Safari, Federal Scapia (have),
HSBC Live+, SC Smart, Yes Bank POP-CLUB, BoB Premier, Kotak League / Kotak 811.
