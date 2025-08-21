# MessagePedia Database Operations

Feature: Connection Management and Cleanup

  Scenario: Proper database connection lifecycle
    Given a database connection is established
    When the application shuts down
    Then the database connection should be properly closed
    And no database locks should remain
    And the database file should be accessible to other instances

  Scenario: Handle concurrent access safely
    Given multiple database operations occur simultaneously
    When WAL mode is enabled
    Then read operations should not block write operations
    And data consistency should be maintained
    And no database corruption should occur