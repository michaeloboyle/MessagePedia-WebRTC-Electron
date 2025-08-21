# MessagePedia End-to-End Integration Scenarios

Feature: Security and Privacy Verification

  Scenario: Direct peer-to-peer communication verification
    Given Alice and Bob are communicating
    When network traffic is monitored
    Then messages should travel directly between peers (not through servers)
    And no message content should pass through the signaling server
    And local databases should be isolated and secure
    And file transfers should be direct peer-to-peer