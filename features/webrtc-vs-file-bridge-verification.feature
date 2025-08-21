# MessagePedia - Secure P2P Messaging for The Collective Intelligence App

Feature: WebRTC vs File Bridge Verification

  Scenario: Confirm actual WebRTC usage (not file simulation)
    Given Alice and Bob are connected
    When Alice sends a message
    Then the message should NOT be written to shared-p2p/message-bridge.json
    And the message should be sent via WebRTC data channel
    And network inspection should show direct peer-to-peer traffic
    And no file system polling should occur for message detection

  Scenario: Real network connectivity test
    Given Alice and Bob are on different network interfaces
    When they establish WebRTC connection
    Then they should communicate directly without file system
    And connection should work across NAT/firewall using ICE/STUN
    And message latency should be minimal (< 100ms for local network)