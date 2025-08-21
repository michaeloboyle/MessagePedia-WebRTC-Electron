# MessagePedia End-to-End Integration Scenarios

Feature: Multi-peer Network Scenarios

  Scenario: Three-way peer communication
    Given Alice, Bob, and Carol all start MessagePedia
    When all three establish WebRTC connections
    Then Alice should connect to both Bob and Carol
    And messages should route appropriately based on topic membership
    And each peer should maintain independent local databases
    
    When Alice sends a message in "General Discussion"
    Then both Bob and Carol should receive it (if they're in the same topic)
    When Bob sends a message in "Tech Talk"
    Then only peers in "Tech Talk" should receive it