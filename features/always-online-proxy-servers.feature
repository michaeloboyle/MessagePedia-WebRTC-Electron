# MessagePedia - The Collective Intelligence App

Feature: Always-Online Proxy Servers

  Scenario: Server Proxy for Offline Availability
    Given Alice wants her Topics to remain available when she's offline
    When Alice installs MessagePedia on an always-online server
    And invites the server to participate in her Topics
    Then the server should act as Alice's proxy when she's offline
    And other Topic members should still be able to access shared content
    And the server should maintain the same security and encryption standards
    And when Alice comes back online, changes should sync automatically

  Scenario: Enterprise Server Integration
    Given an enterprise wants to ensure 24/7 availability for critical Topics
    When they deploy MessagePedia servers in their data center
    And employees invite these servers to their business-critical Topics
    Then the Topics should remain available during off-hours and weekends
    And the enterprise should maintain full control over server infrastructure
    And compliance and data sovereignty should be preserved
    And the servers should not compromise the P2P security model