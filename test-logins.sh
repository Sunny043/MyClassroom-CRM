#!/bin/bash

# Test all coordinator logins
echo "🧪 Testing All Coordinator Logins"
echo "=================================="

coordinators=(
  "csc_coord:csc123456"
  "ds_coord:ds123456"
  "ai_coord:ai123456"
  "it_coord:it123456"
  "cyber_coord:cyber123456"
  "se_coord:se123456"
  "ba_coord:ba123456"
  "dm_coord:dm123456"
)

for coord in "${coordinators[@]}"; do
  username=$(echo $coord | cut -d: -f1)
  password=$(echo $coord | cut -d: -f2)
  
  echo -n "Testing $username... "
  
  response=$(curl -s -X POST http://localhost:4000/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"username\": \"$username\", \"password\": \"$password\"}")
  
  if echo "$response" | grep -q "Login successful"; then
    echo "✅ SUCCESS"
  else
    echo "❌ FAILED"
    echo "   Response: $response"
  fi
done

echo ""
echo "🔑 All tests completed!"
