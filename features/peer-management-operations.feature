# MessagePedia Database Operations

Feature: Peer Management Operations

  Scenario: Store and retrieve peer information
    Given the database is initialized
    When a peer with ID "alice-001", name "Alice", and reputation 100 is stored
    Then the peer should be retrievable by ID "alice-001"
    And the peer record should contain correct name "Alice"
    And the peer should show as online with reputation 100

  Scenario: Update peer status
    Given a peer "alice-001" exists with status "offline"
    When the peer status is updated to "online"
    Then retrieving the peer should show status "online"
    And the last_seen timestamp should be updated

  Scenario: Retrieve all peers sorted by activity
    Given multiple peers exist: Alice (last seen 2 hours ago), Bob (last seen 1 hour ago), Carol (last seen 3 hours ago)
    When all peers are retrieved
    Then they should be ordered: Bob, Alice, Carol (most recent first)

  Scenario: Filter online peers only
    Given peers exist: Alice (online), Bob (offline), Carol (online)
    When online peers are retrieved
    Then only Alice and Carol should be returned
    And Bob should not be in the results