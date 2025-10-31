#!/bin/bash

# Backend API Test Script
# Tests all the userEmail -> userId changes

BASE_URL="http://localhost:3003"
TEST_USER_ID="test-user-$(date +%s)"
TEST_MESSAGE_ID="test-message-$(date +%s)"

echo "🧪 BACKEND API TEST"
echo "==================="
echo ""

# Test 1: Server Health Check
echo "📋 Test 1: Server Health Check"
if curl -s -f "$BASE_URL/health" > /dev/null; then
    echo "✅ Server is running"
else
    echo "❌ Server is not responding"
    exit 1
fi

# Test 2: User Creation with UUID
echo ""
echo "📋 Test 2: User Creation (UUID-based)"
USER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/v1/users" \
    -H "Content-Type: application/json" \
    -H "x-user-id: $TEST_USER_ID" \
    -d "{\"id\":\"$TEST_USER_ID\",\"name\":\"Test User\",\"email\":\"test@example.com\"}")

HTTP_CODE=$(echo "$USER_RESPONSE" | tail -n1)
USER_BODY=$(echo "$USER_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo "✅ User creation successful (HTTP $HTTP_CODE)"
    if echo "$USER_BODY" | grep -q '"id"'; then
        echo "✅ User data contains ID field"
    else
        echo "❌ User data missing ID field"
    fi
    if echo "$USER_BODY" | grep -q '"userEmail"'; then
        echo "❌ User data contains userEmail field (should be removed)"
    else
        echo "✅ User data does not contain userEmail field"
    fi
else
    echo "❌ User creation failed (HTTP $HTTP_CODE)"
    echo "Response: $USER_BODY"
fi

# Test 3: Message Creation with user_id
echo ""
echo "📋 Test 3: Message Creation (user_id-based)"
MESSAGE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/v1/chat" \
    -H "Content-Type: application/json" \
    -d "{\"user_id\":\"$TEST_USER_ID\",\"communityId\":\"comm-001\",\"content\":\"Test message for UUID validation\",\"uri\":\"https://example.com/test\"}")

HTTP_CODE=$(echo "$MESSAGE_RESPONSE" | tail -n1)
MESSAGE_BODY=$(echo "$MESSAGE_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo "✅ Message creation successful (HTTP $HTTP_CODE)"
    if echo "$MESSAGE_BODY" | grep -q '"authorId"'; then
        echo "✅ Message has authorId field"
    else
        echo "❌ Message missing authorId field"
    fi
    if echo "$MESSAGE_BODY" | grep -q '"userEmail"'; then
        echo "❌ Message contains userEmail field (should be removed)"
    else
        echo "✅ Message does not contain userEmail field"
    fi
else
    echo "❌ Message creation failed (HTTP $HTTP_CODE)"
    echo "Response: $MESSAGE_BODY"
fi

# Test 4: Reaction Creation with user_id
echo ""
echo "📋 Test 4: Reaction Creation (user_id-based)"
REACTION_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/v1/reactions" \
    -H "Content-Type: application/json" \
    -d "{\"messageId\":\"$TEST_MESSAGE_ID\",\"emoji\":\"👍\",\"user_id\":\"$TEST_USER_ID\"}")

HTTP_CODE=$(echo "$REACTION_RESPONSE" | tail -n1)
REACTION_BODY=$(echo "$REACTION_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo "✅ Reaction creation successful (HTTP $HTTP_CODE)"
else
    echo "❌ Reaction creation failed (HTTP $HTTP_CODE)"
    echo "Response: $REACTION_BODY"
fi

# Test 5: Presence Event with user_id
echo ""
echo "📋 Test 5: Presence Event (user_id-based)"
PRESENCE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/v1/presence/event" \
    -H "Content-Type: application/json" \
    -H "x-user-id: $TEST_USER_ID" \
    -H "x-user-name: Test User" \
    -d "{\"kind\":\"enter\",\"availability\":\"online\",\"pageId\":\"test-page-$(date +%s)\"}")

HTTP_CODE=$(echo "$PRESENCE_RESPONSE" | tail -n1)
PRESENCE_BODY=$(echo "$PRESENCE_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo "✅ Presence event successful (HTTP $HTTP_CODE)"
else
    echo "❌ Presence event failed (HTTP $HTTP_CODE)"
    echo "Response: $PRESENCE_BODY"
fi

# Test 6: Visibility with user_id
echo ""
echo "📋 Test 6: Visibility (user_id-based)"
VISIBILITY_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/v1/visibility" \
    -H "Content-Type: application/json" \
    -H "x-user-id: $TEST_USER_ID" \
    -H "x-user-name: Test User" \
    -d "{\"is_visible\":true,\"pageId\":\"test-page-$(date +%s)\"}")

HTTP_CODE=$(echo "$VISIBILITY_RESPONSE" | tail -n1)
VISIBILITY_BODY=$(echo "$VISIBILITY_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo "✅ Visibility event successful (HTTP $HTTP_CODE)"
else
    echo "❌ Visibility event failed (HTTP $HTTP_CODE)"
    echo "Response: $VISIBILITY_BODY"
fi

# Test 7: Check for userEmail in responses
echo ""
echo "📋 Test 7: Response Validation (No userEmail fields)"
USERS_RESPONSE=$(curl -s "$BASE_URL/v1/users")
if echo "$USERS_RESPONSE" | grep -q '"userEmail"'; then
    echo "❌ User responses contain userEmail field (should be removed)"
else
    echo "✅ User responses do not contain userEmail field"
fi

echo ""
echo "🎉 API testing complete!"
