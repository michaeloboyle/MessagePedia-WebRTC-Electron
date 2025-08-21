# MessagePedia Database Operations

Feature: Message Storage and Retrieval

  Scenario: Store message with proper relationships
    Given a topic "general" exists with ID "general"
    And a peer "alice-001" exists
    When a message with ID "msg-123", content "Hello World", sender "alice-001", topic "general" is stored
    Then the message should be stored with correct foreign key references
    And retrieving messages for topic "general" should include the message
    And the message should show sender information from the peer table

  Scenario: Retrieve messages with sender names
    Given messages exist from Alice and Bob in topic "general"
    When messages for topic "general" are retrieved
    Then each message should include the sender's display name
    And messages should be ordered by timestamp (newest first for display)
    And message content should be preserved exactly

  Scenario: Handle message storage errors gracefully
    Given a message references a non-existent topic ID
    When attempting to store the message
    Then a foreign key constraint error should be raised
    And the message should not be stored
    And the database should remain in a consistent state

  Scenario: Message search functionality
    Given messages exist with content: "Hello World", "How are you?", "World Peace"
    When searching for messages containing "World"
    Then results should include "Hello World" and "World Peace"
    And results should include sender names and topic information
    And results should be limited to prevent performance issues