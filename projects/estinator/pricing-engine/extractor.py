#!/usr/bin/env python3
"""
Pricing Engine - Bid Tab Extractor
Extracts unit pricing data from NYSDOT and WSDOT bid tabulations
"""

import os
import json
import re
from pathlib import Path
from typing import List, Dict, Optional
import pdfplumber

# Paths
BID_TABS_DIR = "/Users/baibureh/clawd/training-data/bid-tabs"
OUTPUT_DIR = "/Users/baibureh/clawd/projects/estinator/pricing-engine/data"

def extract_nysdot_bidtab(pdf_path: str) -> List[Dict]:
    """Extract line items from NYSDOT bid tab PDF"""
    items = []
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            contract_id = Path(pdf_path).stem.replace("bidtab_", "")
            
            for page in pdf.pages:
                text = page.extract_text()
                if not text:
                    continue
                
                # Look for line item patterns
                # NYSDOT format: Item | Quantity | Unit | Prices...
                lines = text.split('\n')
                
                for line in lines:
                    # Pattern: Item code, quantity, unit, prices
                    # Example: "201.07  0.350  LS  $65,000  $50,000  $60,000"
                    match = re.match(
                        r'(\d{3}\.\d+)\s+([\d.,]+)\s+(\w+)\s+(.+)',
                        line.strip()
                    )
                    
                    if match:
                        item_code = match.group(1)
                        quantity = match.group(2).replace(',', '')
                        unit = match.group(3)
                        price_data = match.group(4)
                        
                        # Extract prices (look for $X,XXX patterns)
                        prices = re.findall(r'\$[\d,]+\.?\d*', price_data)
                        
                        if prices:
                            items.append({
                                "contract_id": contract_id,
                                "state": "NY",
                                "item_code": item_code,
                                "description": "",  # Will need manual mapping or better extraction
                                "quantity": quantity,
                                "unit": unit,
                                "prices": prices,
                                "source_file": pdf_path
                            })
    except Exception as e:
        print(f"Error processing {pdf_path}: {e}")
    
    return items

def extract_wsdot_bidtab(pdf_path: str) -> List[Dict]:
    """Extract line items from WSDOT bid tab PDF"""
    items = []
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if not text:
                    continue
                
                # WSDOT uses different format - annual summaries
                # Will need custom parsing per file
                pass
                
    except Exception as e:
        print(f"Error processing {pdf_path}: {e}")
    
    return items

def process_all_bidtabs():
    """Process all bid tab PDFs and build index"""
    all_items = []
    
    # Process NYSDOT
    ny_dir = Path(BID_TABS_DIR) / "newyork"
    if ny_dir.exists():
        print(f"Processing NYSDOT bid tabs from {ny_dir}")
        pdf_files = list(ny_dir.glob("bidtab_*.pdf"))
        print(f"Found {len(pdf_files)} PDFs")
        
        for i, pdf_file in enumerate(pdf_files[:10]):  # Start with 10 for testing
            print(f"Processing {i+1}/10: {pdf_file.name}")
            items = extract_nysdot_bidtab(str(pdf_file))
            all_items.extend(items)
            print(f"  Extracted {len(items)} items")
    
    # Save to JSON
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    output_file = Path(OUTPUT_DIR) / "pricing_index.json"
    
    with open(output_file, 'w') as f:
        json.dump(all_items, f, indent=2)
    
    print(f"\nSaved {len(all_items)} items to {output_file}")
    return all_items

if __name__ == "__main__":
    process_all_bidtabs()
