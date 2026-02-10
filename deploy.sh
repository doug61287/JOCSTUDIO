#!/bin/bash
cd ~/clawd/projects/jocstudio/product/landing
python3 -m http.server 9003 > /dev/null 2>&1 &
sleep 2
cloudflared tunnel --url http://localhost:9003 2>&1 | grep -m1 "trycloudflare.com" | sed 's/.*https:/https:/' | sed 's/|.*/'
