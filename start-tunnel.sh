#!/bin/bash
# Start tunnel and capture URL
cloudflared tunnel --url http://localhost:8888 > /tmp/tunnel.log 2>&1 &
sleep 8
grep "trycloudflare.com" /tmp/tunnel.log | head -1
