# MessagePedia User Interface Features

Feature: Connection Status and Feedback

  Scenario: Database connection status
    When MessagePedia successfully connects to the database
    Then the status should show "Alice - Database Connected"
    And the status background should be green
    When database connection fails
    Then the status should show "Database Error"
    And the status background should be red

  Scenario: P2P connection status updates
    Given Alice establishes P2P connection with peers
    When P2P messaging is active
    Then the status should update to "Alice - P2P Connected"
    And remain green to indicate active connectivity
    And the status should reflect real-time P2P activity