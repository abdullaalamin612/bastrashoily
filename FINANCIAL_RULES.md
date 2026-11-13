# BASTRA SHOILY — Financial & Accounting Calculation Rules

This document outlines the authoritative financial, inventory, and Profit & Loss (P&L) accounting rules implemented in BASTRA SHOILY e-commerce platform.

---

## 1. Core Financial Principles

1. **Single Source of Truth**: All financial calculations are derived directly from SQLite tables (`orders`, `order_items`, `order_returns`, `purchases`, and `inventory_transactions`). No hardcoded or fabricated financial stats are returned.
2. **Exclusion of Cancelled Orders**: Cancelled orders (`order_status = 'cancelled'`) do NOT generate revenue, do not consume inventory, and do not incur delivery fee collections.
3. **Double-Counting Prevention**:
   - `orders.total` already accounts for item subtotals, applied discount, and delivery charge:
     $$\text{orders.total} = \text{orders.subtotal} - \text{orders.discount} + \text{orders.delivery\_charge}$$
   - When calculating Gross Merchandise Value (GMV) or Revenue, discounts must not be deducted twice.
   - Refunds from `order_returns` (`status = 'refunded'`) represent cash outflows or reversed receivables and are accounted for in the Net Profit calculation.
4. **Historical Cost Integrity**: Product manufacturing / procurement cost is recorded at time of procurement/order. If historical unit costs vary, inventory transactions track inward cost from `purchases` (`items_json`).

---

## 2. Income Statement & Metric Formulas

### 2.1 Gross Revenue (মোট বিক্রয় আয়)
$$\text{Gross Revenue} = \sum_{\substack{\text{orders} \\ \text{order\_status} \neq \text{'cancelled'}}} \text{orders.total}$$

Breakdown:
- **Product Sales Subtotal**: $\sum \text{orders.subtotal}$
- **Delivery Charge Collected**: $\sum \text{orders.delivery\_charge}$
- **Marketing Discounts Given**: $\sum \text{orders.discount}$ (discounts already reduce `orders.total`)

### 2.2 Cost of Goods Sold (COGS - উৎপাদন ও তাঁত খরচ)
COGS represents the direct material (খাঁটি সুতি সুতা, রং, নকশা) and weaver labor cost (তাঁত কারিগর মজুরি).
- When supplier purchase records exist in `purchases` (`status = 'received'`), real purchase costs apply.
- For items sold from artisan weaving lots without separate purchase orders, COGS is calculated based on the standardized Sirajganj Handloom weaving baseline (62% of product base price) or unit procurement value.
- Formula:
  $$\text{COGS} = \sum_{\substack{\text{order\_items} \\ \text{non-cancelled}}} (\text{quantity} \times \text{unit\_cost})$$

### 2.3 Logistics & Courier Expense (কুরিয়ার ও ডেলিভারি ব্যয়)
- Calculated from orders dispatched through courier partners (e.g. Steadfast / Sundarban):
  - Local / Inside Sirajganj delivery cost: ৳60 – ৳70 per parcel
  - Outside Sirajganj nationwide delivery cost: ৳120 – ৳130 per parcel
- Net delivery balance:
  $$\text{Net Delivery Position} = \text{Delivery Collected from Customers} - \text{Courier Freight Paid}$$

### 2.4 Refunds & Returns (রিটার্ন ও ফেরত)
- Deducted from net earnings:
  $$\text{Total Refunds} = \sum_{\substack{\text{order\_returns} \\ \text{status} = \text{'refunded'}}} \text{total\_refund\_amount}$$

### 2.5 Net Profit (প্রকৃত নিট মুনাফা)
$$\text{Net Profit} = \text{Gross Revenue} - \text{Total Refunds} - \text{COGS} - \text{Courier Expense}$$

### 2.6 Net Profit Margin (মুনাফার হার)
$$\text{Profit Margin} = \left(\frac{\text{Net Profit}}{\text{Gross Revenue}}\right) \times 100\%$$
*(If Gross Revenue is 0, Profit Margin is 0.0%)*

---

## 3. Time Filtering Rules
The `/api/admin/reports/profit-loss` endpoint accepts `range`:
- `today`: `date(created_at) = date('now', 'localtime')`
- `week`: `date(created_at) >= date('now', '-7 days', 'localtime')`
- `month`: `date(created_at) >= date('now', 'start of month', 'localtime')`
- `year`: `date(created_at) >= date('now', 'start of year', 'localtime')`
- `all`: All non-cancelled orders across the lifetime of the store.

---

## 4. Audit & Verification Trail
Every status mutation, refund approval, purchase intake, and inventory adjustment writes an append-only entry to `audit_logs` and `order_timeline` or `inventory_transactions`.
