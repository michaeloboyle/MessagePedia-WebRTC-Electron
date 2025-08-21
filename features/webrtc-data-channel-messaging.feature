# MessagePedia - Secure P2P Messaging for The Collective Intelligence App

Feature: WebRTC Data Channel Messaging

  Scenario: Message serialization and transmission
    Given Alice and Bob have established WebRTC data channels
    When Alice sends a message with special characters "Hello 🌍! Test & <test>"
    Then the message should be properly JSON serialized
    And transmitted via WebRTC data channel
    And Bob should receive the exact same content with special characters intact

  Scenario: Message ordering and delivery guarantees
    Given Alice sends multiple messages rapidly: "Message 1", "Message 2", "Message 3"
    When all messages are sent via WebRTC data channel
    Then Bob should receive all messages in the correct order
    And no messages should be lost or duplicated
    And each message should have unique timestamps

  Scenario: Large message handling
    Given Alice sends a very long message (2000+ characters)
    When the message exceeds typical data channel limits
    Then the message should be automatically chunked
    And transmitted in multiple data channel packets
    And Bob should receive the complete message reassembled correctly