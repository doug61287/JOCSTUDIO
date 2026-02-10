#!/bin/bash
cd product/backend
npx prisma generate
exec npx tsx src/server.ts
