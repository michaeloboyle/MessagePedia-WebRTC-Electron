# MessagePedia Database Operations

Feature: Topic Management Operations

  Scenario: Create and store topics
    Given the database is initialized
    When a topic with ID "general", name "General Discussion", creator "alice-001" is stored
    Then the topic should be retrievable by ID "general"
    And the topic should have correct name and creator information
    And the topic should show current timestamp for last_activity

  Scenario: Add and retrieve topic members
    Given a topic "general" exists
    When peer "alice-001" is added as a member with role "admin"
    And peer "bob-002" is added as a member with role "member"
    Then retrieving topics for "alice-001" should include "general"
    And retrieving topics for "bob-002" should include "general"
    And Alice should have "admin" role, Bob should have "member" role

  Scenario: Update topic activity timestamp
    Given a topic "general" with old last_activity timestamp
    When a new message is added to the topic
    Then the topic's last_activity should be updated to current time