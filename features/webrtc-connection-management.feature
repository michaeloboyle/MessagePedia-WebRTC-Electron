# MessagePedia - Secure P2P Messaging for The Collective Intelligence App
  
Feature: WebRTC Connection Management
  
  Scenario: Peer discovery through signaling server
    Given the signaling server is running on localhost:3000
    When Alice connects to MessagePedia
    Then Alice should register with the signaling server
    And announce her availability for peer connections
    When Bob connects to MessagePedia
    Then Bob should discover Alice through the signaling server
    And initiate WebRTC connection establishment

  Scenario: ICE candidate exchange
    Given Alice and Bob are attempting to connect
    When they exchange ICE candidates through the signaling server
    Then they should establish a direct peer-to-peer connection
    And the connection should bypass the signaling server for messaging
    And only use signaling server for initial discovery

  Scenario: Connection failure and recovery
    Given Alice and Bob lose their WebRTC connection
    When the connection is lost
    Then both should show "Connection Lost" status
    And messages should queue locally until reconnection
    When the connection is restored
    Then queued messages should be transmitted
    And real-time messaging should resume

  Scenario: Multiple peer connections
    Given Alice, Bob, and Carol are all online
    When they establish WebRTC connections
    Then Alice should connect to both Bob and Carol
    And messages should route to appropriate peers based on topic membership
    And each peer should maintain separate data channels