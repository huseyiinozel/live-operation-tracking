if [ -z "$1" ]; then
  echo "❌ Error: Vehicle ID is required!"
  echo "Usage: ./simulate-gps.sh VEHICLE_ID"
  echo ""
  echo "To get your Vehicle ID:"
  echo "1. Connect to MongoDB, or"
  echo "2. Check the backend seed output, or"
  echo "3. Call http://localhost:5001/api/vehicles (with token)"
  exit 1
fi

VEHICLE_ID=$1
API_URL="http://localhost:5001"

echo "🚐 Starting GPS Simulation..."
echo "📍 Vehicle ID: $VEHICLE_ID"
echo "🔄 Sending GPS update every 5 seconds..."
echo "⏹️  Press Ctrl+C to stop"
echo ""


ROUTE=(
  
  "13.750,100.491,0,0"          # Start - parked
  "13.750,100.491,45,5"         # Engine started
  "13.7498,100.4915,90,15"      # Started moving
  "13.7495,100.4920,95,25"      # Accelerating
  "13.7490,100.4925,100,35"     # Good speed
  
  
  "13.7485,100.4928,105,40"     # Continuing
  "13.7480,100.4930,110,45"     # Full throttle
  "13.7475,100.4931,115,40"     # Starting to slow down
  "13.7470,100.4932,120,30"     # Approaching stop
  "13.7468,100.4932,125,20"     # Very slow
  "13.7467,100.4933,130,10"     # Almost stopped
  "13.7467,100.4933,130,0"      # STOPPED - 1st passenger boarding
  "13.7467,100.4933,130,0"      # Waiting
  "13.7467,100.4933,180,5"      # Moving again
  
 
  "13.7470,100.4940,185,20"     # Accelerating
  "13.7475,100.4950,190,30"     # Good speed
  "13.7480,100.4960,195,40"     # Continuing
  "13.7485,100.4970,200,45"     # Fast
  "13.7490,100.4980,205,50"     # Full speed
  "13.7495,100.4985,210,50"     # Continuing
  "13.7500,100.4990,215,45"     # Slowing down
  

  "13.7505,100.4993,220,40"     # Slowing down more
  "13.7510,100.4995,225,35"     # Slower
  "13.7515,100.4997,230,30"     # Slow
  "13.7518,100.4998,235,25"     # Very slow
  "13.7519,100.4999,240,20"     # Near the stop
  "13.7520,100.5000,245,10"     # Almost stopped
  "13.752,100.500,250,0"        # STOPPED - Final point
  "13.752,100.500,250,0"        # Route completed
)

STEP=0
MAX_STEPS=${#ROUTE[@]}

while true; do
  # Get current route point
  POINT=${ROUTE[$STEP]}
  IFS=',' read -r LAT LNG HEADING SPEED <<< "$POINT"
  
  # Create timestamp
  TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  
  # Send GPS heartbeat
  RESPONSE=$(curl -s -X POST "$API_URL/api/vehicles/$VEHICLE_ID/heartbeat" \
    -H "Content-Type: application/json" \
    -d "{
      \"lat\": $LAT,
      \"lng\": $LNG,
      \"heading\": $HEADING,
      \"speed\": $SPEED,
      \"timestamp\": \"$TIMESTAMP\"
    }")
  
  # Display status
  echo "📡 [$TIMESTAMP] Lat: $LAT, Lng: $LNG, Heading: ${HEADING}°, Speed: ${SPEED} km/h"
  
  # Move to next point
  STEP=$((STEP + 1))
  
  # Restart route when finished
  if [ $STEP -ge $MAX_STEPS ]; then
    echo ""
    echo "🔄 Route completed, restarting..."
    echo ""
    STEP=0
  fi
  
  # Wait 5 seconds
  sleep 5
done
