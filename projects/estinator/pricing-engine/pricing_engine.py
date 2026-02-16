#!/usr/bin/env python3
"""
Pricing Engine for Estinator
Extracts and indexes unit pricing from bid tabulations
"""

import os
import json
import re
from pathlib import Path
import pdfplumber
from datetime import datetime

class PricingEngine:
    def __init__(self, data_dir="/Users/baibureh/clawd/training-data/bid-tabs"):
        self.data_dir = Path(data_dir)
        self.index = []
        
    def infer_unit(self, item_code):
        """Infer unit of measure from NYSDOT item code"""
        # Common NYSDOT item code patterns
        code_prefix = item_code.split('.')[0]
        
        units = {
            '201': 'LS',      # Clearing and grubbing
            '202': 'LS',      # Removal
            '203': 'CY',      # Excavation
            '204': 'SF',      # Milling
            '205': 'CY',      # Borrow
            '206': 'SF',      # Structure excavation
            '208': 'SF',      # Erosion control
            '209': 'SF',      # Seeding/mulching
            '210': 'SF',      # Erosion control blankets
            '304': 'TON',     # Aggregate base
            '402': 'TON',     # Hot mix asphalt
            '403': 'TON',     # HMA
            '404': 'TON',     # HMA
            '407': 'TON',     # Tack coat
            '502': 'LF',      # Fence
            '520': 'SF',      # Sod
            '552': 'SF',      # Topsoil
            '553': 'EA',      # Trees
            '603': 'LF',      # Curb
            '604': 'EA',      # Inlets/manholes
            '606': 'SF',      # Sidewalk
            '607': 'SF',      # Detectable warnings
            '608': 'EA',      # Traffic signs
            '609': 'SF',      # Concrete pavement
            '610': 'SF',      # PCC pavement
            '611': 'LF',      # Barrier
            '614': 'EA',      # Lighting
            '617': 'SF',      # Pavement markings
            '619': 'LS',      # Mobilization/misc
            '620': 'SF',      # Pavement markings
            '625': 'LS',      # Traffic control
            '634': 'LF',      # Underdrains
            '640': 'EA',      # Traffic signals
            '644': 'LS',      # ITS
            '645': 'LS',      # Electrical
            '649': 'EA',      # Guardrail
            '650': 'LF',      # Guardrail
            '669': 'EA',      # Lighting poles
        }
        
        return units.get(code_prefix, 'EA')  # Default to EA (each)
    
    def get_item_description(self, item_code):
        """Get description for NYSDOT item code"""
        # Common NYSDOT item descriptions (simplified)
        descriptions = {
            '201.07': 'Clearing and Grubbing',
            '203.02': 'Channel Excavation',
            '203.03': 'Borrow Excavation',
            '203.07': 'Wet Excavation',
            '205.05': 'Borrow',
            '206.02': 'Structure Excavation',
            '206.03': 'Trench Excavation',
            '209.11': 'Seeding',
            '209.13': 'Mulching',
            '304.00': 'Aggregate Base Course',
            '304.10': 'Aggregate Base',
            '404.00': 'Hot Mix Asphalt',
            '404.01': 'HMA Pavement',
            '404.06': 'HMA Base Course',
            '404.09': 'HMA Surface Course',
            '404.19': 'HMA Binder Course',
            '407.01': 'Tack Coat',
            '502.00': 'Fence',
            '502.10': 'Chain Link Fence',
            '502.31': 'Fence Removal',
            '520.05': 'Sod',
            '520.09': 'Topsoil',
            '552.17': 'Topsoil Furnish & Place',
            '553.03': 'Tree Planting',
            '603.60': 'Curb',
            '604.07': 'Inlets',
            '604.13': 'Manholes',
            '606.27': 'Sidewalk',
            '606.66': 'Concrete Walk',
            '606.67': 'Detectable Warnings',
            '606.69': 'ADA Ramps',
            '607.05': 'Detectable Warnings',
            '608.01': 'Traffic Signs',
            '608.02': 'Sign Post',
            '609.04': 'Concrete Pavement',
            '610.07': 'PCC Pavement',
            '610.08': 'PCC Sidewalk',
            '610.13': 'PCC Base',
            '611.01': 'Concrete Barrier',
            '614.04': 'Lighting',
            '614.05': 'Conduit',
            '614.06': 'Electrical',
            '617.01': 'Pavement Markings',
            '619.01': 'Mobilization',
            '619.04': 'Maintenance & Protection',
        }
        
        # Try exact match first
        if item_code in descriptions:
            return descriptions[item_code]
        
        # Try prefix match
        prefix = item_code[:3]
        for code, desc in descriptions.items():
            if code.startswith(prefix):
                return desc
        
        return f"Item {item_code}"
        
    def extract_nysdot_bidtab(self, pdf_path):
        """Extract data from NYSDOT bid tab PDF"""
        items = []
        
        try:
            with pdfplumber.open(pdf_path) as pdf:
                contract_id = Path(pdf_path).stem.replace("bidtab_", "")
                
                # Extract header info from first page
                header_text = pdf.pages[0].extract_text()
                
                # Parse letting date
                date_match = re.search(r'(\d{2}/\d{2}/\d{4})', header_text)
                letting_date = date_match.group(1) if date_match else "Unknown"
                
                # Parse contract description
                desc_match = re.search(r'Contract Description:\s*(.+)', header_text)
                description = desc_match.group(1) if desc_match else "Unknown"
                
                # Look for line item spread reports (usually later pages)
                for i, page in enumerate(pdf.pages):
                    text = page.extract_text()
                    if not text:
                        continue
                    
                    # Look for "Line Item Spread Report" section
                    if "Line Item Spread Report" in text or "Item" in text and "Quantity" in text:
                        lines = text.split('\n')
                        
                        for line in lines:
                            # Pattern: Item Code | Description | Quantity | Unit | Bid Prices...
                            # Example: "201.07  Clearing and Grubbing  0.350  LS  $65,000.00  $50,000.00"
                            
                            # Match line item pattern:
                            # ItemCode Quantity Bidder1 Bidder2 Bidder3 Bidder4
                            # Example: "201.07 0.350 65,000.00000 50,000.00000 60,000.00000 40,000.00000"
                            parts = line.strip().split()
                            
                            # Check if first part looks like an item code (digits.digits)
                            if len(parts) >= 3 and re.match(r'\d{3}\.\d{2,4}', parts[0]):
                                item_code = parts[0]
                                quantity_str = parts[1]
                                
                                # The rest are prices (4 bidders typically)
                                price_strings = parts[2:6]  # Up to 4 bidder prices
                                
                                # Convert prices to floats
                                prices = []
                                for p in price_strings:
                                    try:
                                        # Remove commas and convert
                                        price_val = float(p.replace(',', ''))
                                        if price_val > 0:  # Valid price
                                            prices.append(price_val)
                                    except:
                                        pass
                                
                                # Determine unit from item code patterns
                                unit = self.infer_unit(item_code)
                                
                                if prices:
                                    # Parse quantity (may have commas)
                                    try:
                                        quantity = float(quantity_str.replace(',', ''))
                                    except:
                                        quantity = 0
                                    
                                    # Get description from NYSDOT standard items (we'll need to map these)
                                    description = self.get_item_description(item_code)
                                    
                                    item = {
                                        "contract_id": contract_id,
                                        "state": "NY",
                                        "letting_date": letting_date,
                                        "project_description": description,
                                        "item_code": item_code,
                                        "description": description,
                                        "quantity": quantity,
                                        "unit": unit,
                                        "prices": prices,
                                        "low_price": min(prices) if prices else None,
                                        "avg_price": sum(prices)/len(prices) if prices else None,
                                        "page": i + 1
                                    }
                                    items.append(item)
                                    
        except Exception as e:
            print(f"Error processing {pdf_path}: {e}")
        
        return items
    
    def build_index(self, limit=50):
        """Build pricing index from all bid tabs"""
        print("Building pricing index...")
        
        # Process NYSDOT
        ny_dir = self.data_dir / "newyork"
        if ny_dir.exists():
            pdf_files = list(ny_dir.glob("bidtab_*.pdf"))[:limit]
            print(f"Processing {len(pdf_files)} NYSDOT bid tabs...")
            
            for i, pdf_file in enumerate(pdf_files):
                if i % 10 == 0:
                    print(f"  Progress: {i}/{len(pdf_files)}")
                items = self.extract_nysdot_bidtab(str(pdf_file))
                self.index.extend(items)
        
        print(f"\nTotal items indexed: {len(self.index)}")
        return self.index
    
    def save_index(self, output_path):
        """Save index to JSON"""
        with open(output_path, 'w') as f:
            json.dump(self.index, f, indent=2)
        print(f"Index saved to {output_path}")
    
    def search(self, query, state=None, year=None):
        """Search pricing data"""
        results = []
        query_lower = query.lower()
        
        for item in self.index:
            # Text match
            match = (query_lower in item['description'].lower() or 
                    query_lower in item['item_code'])
            
            # State filter
            if state and item['state'] != state:
                continue
                
            # Year filter
            if year and year not in item['letting_date']:
                continue
            
            if match:
                results.append(item)
        
        return results
    
    def get_stats(self, item_code=None, state=None):
        """Get pricing statistics"""
        filtered = self.index
        
        if item_code:
            filtered = [i for i in filtered if item_code in i['item_code']]
        if state:
            filtered = [i for i in filtered if i['state'] == state]
        
        if not filtered:
            return None
        
        prices = [i['low_price'] for i in filtered if i['low_price']]
        
        return {
            "count": len(filtered),
            "min": min(prices) if prices else None,
            "max": max(prices) if prices else None,
            "avg": sum(prices)/len(prices) if prices else None,
            "state": state or "All",
            "item_code": item_code or "All"
        }

# CLI interface
if __name__ == "__main__":
    import sys
    
    engine = PricingEngine()
    
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python pricing_engine.py build [limit]  - Build index")
        print("  python pricing_engine.py search <query> [state]  - Search pricing")
        print("  python pricing_engine.py stats [item_code] [state]  - Get stats")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "build":
        limit = int(sys.argv[2]) if len(sys.argv) > 2 else 50
        engine.build_index(limit=limit)
        
        output_dir = Path("/Users/baibureh/clawd/projects/estinator/pricing-engine/data")
        output_dir.mkdir(parents=True, exist_ok=True)
        engine.save_index(output_dir / "pricing_index.json")
        
    elif command == "search":
        query = sys.argv[2]
        state = sys.argv[3] if len(sys.argv) > 3 else None
        
        # Load existing index
        index_path = Path("/Users/baibureh/clawd/projects/estinator/pricing-engine/data/pricing_index.json")
        if index_path.exists():
            with open(index_path) as f:
                engine.index = json.load(f)
        
        results = engine.search(query, state=state)
        print(f"\nFound {len(results)} results for '{query}':")
        for r in results[:10]:
            print(f"  {r['item_code']}: {r['description']}")
            print(f"    Low: ${r['low_price']:.2f} / {r['unit']}")
            print(f"    Contract: {r['contract_id']} ({r['letting_date']})")
            
    elif command == "stats":
        item_code = sys.argv[2] if len(sys.argv) > 2 else None
        state = sys.argv[3] if len(sys.argv) > 3 else None
        
        index_path = Path("/Users/baibureh/clawd/projects/estinator/pricing-engine/data/pricing_index.json")
        if index_path.exists():
            with open(index_path) as f:
                engine.index = json.load(f)
        
        stats = engine.get_stats(item_code, state)
        if stats:
            print(f"\nPricing Stats:")
            print(f"  Items: {stats['count']}")
            print(f"  Min: ${stats['min']:.2f}")
            print(f"  Max: ${stats['max']:.2f}")
            print(f"  Avg: ${stats['avg']:.2f}")
        else:
            print("No data found")
