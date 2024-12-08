Create Private Game Room
Creates a new private game room with custom settings.
Endpoint
create
Authentication
Requires authentication
User must be logged in
Request Body
| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| categoryIds | number[] | Yes | Array of category IDs to include in the game | Must be valid category IDs |
| roundDurationSeconds | number | Yes | Duration of each round in seconds | Min: 10, Max: 120 |
| maxGuessesPerRound | number | Yes | Maximum number of guesses allowed per round | Min: 1, Max: 50 |
| minPrice | number | Conditional | Minimum price filter for listings | Required when selecting single category |
| maxPrice | number | Conditional | Maximum price filter for listings | Required when selecting single category |
Business Rules
When selecting a single category (categoryIds.length === 1):
minPrice and maxPrice are required
Category must have at least 50 listings
When selecting multiple categories (categoryIds.length > 1):
Price filters (minPrice and maxPrice) are not allowed
Response
Success Response (201 Created)
}
Error Responses
400 Bad Request
}
When one or more category IDs don't exist.
}
When a single category has fewer than 50 listings.
}
When price filters are provided with multiple categories.
422 Unprocessable Entity
Returned when validation fails for the request body.
Notes
Room slug is automatically generated using a combination of Turkish color, animal names, and a random hex string
Room name is created using the format: ${username} - ${slug}
All rooms are created with a fixed maximum of 10 rounds
Room status is initially set to "WAITING"
minPrice and maxPrice is not allowed if user selects multiple categories

You're right, I apologize for the confusion. Let me update the documentation to make this rule clearer:
Create Private Game Room
Creates a new private game room with custom settings.
Endpoint
create
Authentication
Requires authentication
User must be logged in
Request Body
| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| categoryIds | number[] | Yes | Array of category IDs to include in the game | Must be valid category IDs |
| roundDurationSeconds | number | Yes | Duration of each round in seconds | Min: 10, Max: 120 |
| maxGuessesPerRound | number | Yes | Maximum number of guesses allowed per round | Min: 1, Max: 50 |
| minPrice | number | Conditional | Minimum price filter for listings | Only allowed and required when selecting single category |
| maxPrice | number | Conditional | Maximum price filter for listings | Only allowed and required when selecting single category |
Business Rules

1. When selecting a single category (categoryIds.length === 1):
   minPrice and maxPrice are required
   Category must have at least 50 listings
   When selecting multiple categories (categoryIds.length > 1):
   Price filters (minPrice and maxPrice) must not be provided
   Request will be rejected if price filters are included
   Response
   Success Response (201 Created)
   }
   Error Responses
   400 Bad Request
   }
   When one or more category IDs don't exist.
   }
   When a single category has fewer than 50 listings.
   }
   When price filters are provided with multiple categories.
   422 Unprocessable Entity
   Returned when validation fails for the request body.
   Notes
   Room slug is automatically generated using a combination of Turkish color, animal names, and a random hex string
   Room name is created using the format: ${username} - ${slug}
   All rooms are created with a fixed maximum of 10 rounds
   Room status is initially set to "WAITING"
