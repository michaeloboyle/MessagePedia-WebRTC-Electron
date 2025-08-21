# MessagePedia - Secure P2P Messaging for The Collective Intelligence App

Feature: Real-time WebRTC Messaging with End-to-End Encryption
  As a professional service provider using The Collective Intelligence App
  I want to send encrypted messages directly to clients and colleagues using WebRTC
  So that we can communicate securely without cloud servers or third-party access

  Background:
    Given Alice is a financial advisor using MessagePedia with peer ID "alice-001"
    And Bob is her client using MessagePedia with peer ID "bob-002" 
    And both instances create separate local databases (alice.db, bob.db)
    And all content remains on their respective systems (no cloud upload)
    And the WebRTC signaling server facilitates connection only (zero-knowledge)
    And end-to-end encryption is enabled for all communications

  Scenario: Initial WebRTC connection establishment
    Given Alice and Bob are both online
    When they discover each other through the signaling server
    Then Alice should see Bob in her "Connected Peers" list
    And Bob should see Alice in his "Connected Peers" list
    And WebRTC data channels should be established between them
    And both should show "WebRTC Connected" status

  Scenario: Send encrypted message via WebRTC data channel
    Given Alice and Bob have established secure WebRTC connection
    And both are in "Financial Planning Discussion" topic
    When Alice types "Your portfolio review is ready for discussion" and presses Enter
    Then the message should be encrypted end-to-end before transmission
    And the message should be sent via WebRTC data channel (not file bridge)
    And no third-party servers should have access to message content
    And Alice should see her message in her chat window
    And Bob should receive the decrypted message in real-time
    And Bob should see "Alice: Your portfolio review is ready for discussion" in his chat window
    And both encrypted messages should be stored in their respective local databases
    And the signaling server should have zero knowledge of message content

  Scenario: Topic-based message routing
    Given Alice and Bob are WebRTC connected
    When Alice is in "General Discussion" and Bob is in "Tech Talk"
    And Alice sends "General message" 
    Then Bob should not receive the message (different topics)
    When Bob switches to "General Discussion"
    Then Bob should see Alice's message history for that topic
    But not see messages from other topics

  Scenario: Bidirectional messaging
    Given Alice and Bob are WebRTC connected in "General Discussion"
    When Alice sends "Hi Bob!"
    And Bob receives the message and replies "Hi Alice!"
    Then Alice should receive Bob's reply in real-time
    And both should see the conversation thread in chronological order
    And each message should show the correct sender name