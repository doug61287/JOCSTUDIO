# Pricing Engine for Estinator
## Construction Cost Database from Bid Tabulations

### Data Sources
- **NYSDOT**: 321 bid tabulations (79 MB) - 2024-2026 lettings
- **WSDOT**: 8 annual summaries (1.7 MB) - 2020-2025

### Indexing Strategy
1. Extract text from PDF bid tabs using OCR
2. Parse line items (item code, description, quantity, unit prices)
3. Store in structured format (JSON/CSV)
4. Enable search by:
   - Item description ("PVC pipe", "concrete", etc.)
   - CSI code (201.07, 203.02, etc.)
   - Location (NYC, Texas, Washington)
   - Date range (2024, 2025)

### Schema
```typescript
interface BidItem {
  contractId: string;
  lettingDate: string;
  state: string; // NY, WA, TX
  itemCode: string;
  description: string;
  quantity: number;
  unit: string;
  prices: {
    engineerEstimate: number;
    bidder1: { name: string; price: number };
    bidder2: { name: string; price: number };
    bidder3: { name: string; price: number };
    // ... more bidders
  };
  lowBid: number;
  avgBid: number;
}
```

### Usage
```typescript
// Query examples
pricingEngine.search("6 inch PVC pipe in NYC");
pricingEngine.getAveragePrice("203.02", "NY", 2024);
pricingEngine.compareStates("concrete", ["NY", "TX", "WA"]);
```

### Status
- [ ] Extract data from NYSDOT PDFs
- [ ] Extract data from WSDOT PDFs
- [ ] Build searchable index
- [ ] Create query interface
- [ ] Integrate with Estinator agent
