# MessagePedia End-to-End Integration Scenarios

Feature: Error Handling and Recovery

  Scenario: WebRTC connection failure graceful handling
    Given Alice and Bob are attempting to connect
    When WebRTC connection establishment fails
    Then both should show appropriate error messages
    And applications should remain stable and functional
    And users should be able to retry connection
    And the signaling server should handle reconnection attempts

  Scenario: Database corruption recovery
    Given Alice's database becomes corrupted
    When Alice starts MessagePedia
    Then the application should detect the corruption
    And create a fresh database with proper schema
    And Alice should be able to continue using the application
    And new connections and messages should work normally