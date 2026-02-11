#!/bin/bash
# Start Cloudflare tunnels for all dashboards

echo "🚀 Starting Cloudflare tunnels..."

# JOCstudio (port 3400)
cloudflared tunnel --url http://localhost:3400 &
JOC_PID=$!
echo "JOCstudio tunnel PID: $JOC_PID"

# Mission Control (port 4000)
cloudflared tunnel --url http://localhost:4000 &
MC_PID=$!
echo "Mission Control tunnel PID: $MC_PID"

# Mac Status (port 3999)
cloudflared tunnel --url http://localhost:3999 &
STATUS_PID=$!
echo "Mac Status tunnel PID: $STATUS_PID"

echo ""
echo "Tunnels starting... URLs will appear above ☝️"
echo "Save these URLs! They change each time."
echo ""
echo "To stop all tunnels: kill $JOC_PID $MC_PID $STATUS_PID"

wait
