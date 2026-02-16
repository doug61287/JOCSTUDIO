#!/usr/bin/env python3
"""
Estinator Pricing Tool
Query construction pricing from bid tab database
"""

import json
from pathlib import Path

class EstinatorPricing:
    def __init__(self):
        self.index_path = Path("/Users/baibureh/clawd/projects/estinator/pricing-engine/data/pricing_index.json")
        self.index = []
        self.load_index()
    
    def load_index(self):
        """Load pricing index"""
        if self.index_path.exists():
            with open(self.index_path) as f:
                self.index = json.load(f)
            print(f"Loaded {len(self.index)} pricing items")
        else:
            print("Warning: Pricing index not found. Run pricing_engine.py build first.")
    
    def query(self, material, location="NY", year=None):
        """
        Query pricing for a material
        
        Args:
            material: Material description (e.g., "asphalt", "concrete", "curb")
            location: State code (default: "NY")
            year: Filter by year (e.g., "2024")
        
        Returns:
            List of matching pricing items
        """
        results = []
        query_lower = material.lower()
        
        for item in self.index:
            # Location filter
            if location and item['state'] != location:
                continue
            
            # Year filter
            if year and year not in item['letting_date']:
                continue
            
            # Text search in description or item code
            match = (query_lower in item['description'].lower() or 
                    query_lower in item['item_code'])
            
            if match:
                results.append(item)
        
        return results
    
    def get_price_summary(self, material, location="NY"):
        """
        Get price summary statistics
        
        Returns:
            Dict with count, min, max, avg prices
        """
        results = self.query(material, location)
        
        if not results:
            return None
        
        prices = [r['low_price'] for r in results if r['low_price'] and r['low_price'] > 0]
        units = [r['unit'] for r in results]
        most_common_unit = max(set(units), key=units.count) if units else 'EA'
        
        return {
            "material": material,
            "location": location,
            "count": len(results),
            "unit": most_common_unit,
            "min_price": min(prices) if prices else None,
            "max_price": max(prices) if prices else None,
            "avg_price": sum(prices)/len(prices) if prices else None,
            "recent_date": max([r['letting_date'] for r in results]) if results else None,
            "sample_contracts": list(set([r['contract_id'] for r in results[:5]]))
        }
    
    def format_response(self, material, location="NY"):
        """Format pricing response for Estinator"""
        summary = self.get_price_summary(material, location)
        
        if not summary:
            return f"No pricing data found for '{material}' in {location}."
        
        response = f"""💰 PRICING DATA: {material.upper()}

Based on {summary['count']} bid items from NYSDOT ({summary['recent_date']}):

📊 PRICE RANGE:
• Low: ${summary['min_price']:.2f} / {summary['unit']}
• Average: ${summary['avg_price']:.2f} / {summary['unit']}
• High: ${summary['max_price']:.2f} / {summary['unit']}

📋 SOURCE CONTRACTS:
"""
        for contract in summary['sample_contracts']:
            response += f"• Contract {contract}\n"
        
        response += """
⚠️  NOTE: Prices are from DOT highway construction bids.
May differ for building construction projects.
"""
        return response

# CLI interface
if __name__ == "__main__":
    import sys
    
    pricing = EstinatorPricing()
    
    if len(sys.argv) < 2:
        print("Usage: python estinator_pricing.py <material> [location]")
        print("Examples:")
        print("  python estinator_pricing.py asphalt")
        print("  python estinator_pricing.py concrete NY")
        sys.exit(1)
    
    material = sys.argv[1]
    location = sys.argv[2] if len(sys.argv) > 2 else "NY"
    
    print(pricing.format_response(material, location))
