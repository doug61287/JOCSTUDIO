#!/bin/bash
# POD Agent Full Pipeline Runner
# Usage: ./run-pipeline.sh [niche]
# Example: ./run-pipeline.sh cat-mom

set -e

NICHE=${1:-cat-mom}
DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║     🐾 POD Agent Pipeline           ║"
echo "╚══════════════════════════════════════╝"
echo "  Niche: $NICHE"
echo "  Date: $(date)"
echo ""

# Module 1: Trend Scout
echo "━━━ [1/5] Trend Scout ━━━━━━━━━━━━━━━━━"
python3 "$DIR/trend-scout.py" "$NICHE"

# Module 2: Design Generation
echo ""
echo "━━━ [2/5] Design Generation ━━━━━━━━━━"
node "$DIR/design-gen.js"

# Module 3: Mockup Creation
echo ""
echo "━━━ [3/5] Mockup Engine ━━━━━━━━━━━━━━"
node "$DIR/mockup-engine.js"

# Module 4: Listing Copy
echo ""
echo "━━━ [4/5] Listing Writer ━━━━━━━━━━━━━"
node "$DIR/listing-writer.js"

# Module 5: Publish to Etsy
echo ""
echo "━━━ [5/5] Publisher ━━━━━━━━━━━━━━━━━━"
node "$DIR/publisher.js"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║     ✅ Pipeline Complete!            ║"
echo "╚══════════════════════════════════════╝"
echo ""
echo "Check Etsy drafts: https://www.etsy.com/your/shops/me/tools/listings"
