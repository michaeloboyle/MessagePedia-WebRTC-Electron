# MessagePedia End-to-End Integration Scenarios

Feature: Performance and Scalability

  Scenario: Large message volume handling
    Given Alice and Bob are connected
    When they exchange 100+ messages rapidly
    Then all messages should be transmitted and stored correctly
    And the interface should remain responsive
    And memory usage should remain reasonable
    And database performance should be acceptable

  Scenario: Large file transfer performance
    Given Alice shares a 10MB file with Bob
    When the file is transferred via WebRTC
    Then the transfer should complete successfully
    And progress should be shown to both users
    And the file should be transmitted in appropriate chunks
    And system resources should be managed efficiently