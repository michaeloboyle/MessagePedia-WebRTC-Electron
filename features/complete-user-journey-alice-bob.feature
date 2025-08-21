# MessagePedia End-to-End Integration Scenarios

Feature: Complete User Journey - Alice and Bob Communication
  As Alice and Bob
  We want to demonstrate the complete MessagePedia workflow
  From startup to file sharing to ensure all components work together

  Background:
    Given the WebRTC signaling server is running on localhost:3000
    And no previous MessagePedia instances are running

  Scenario: Full application startup and peer discovery
    When Alice starts MessagePedia with ID "alice-001" and name "Alice"
    Then Alice's window should show title "MessagePedia - Alice"
    And Alice's database "alice.db" should be created with proper schema
    And Alice should register with the signaling server
    And Alice's status should show "Alice - Database Connected"
    
    When Bob starts MessagePedia with ID "bob-002" and name "Bob"
    Then Bob's window should show title "MessagePedia - Bob"
    And Bob's database "bob.db" should be created independently
    And Bob should discover Alice through the signaling server
    And both should establish WebRTC peer-to-peer connection
    
    Then Alice should see "Bob 🟢 Online" in her peer list
    And Bob should see "Alice 🟢 Online" in his peer list
    And both should show "WebRTC Connected" status

  Scenario: Topic selection and message exchange workflow
    Given Alice and Bob are connected via WebRTC
    When Alice selects "General Discussion" topic
    And Bob selects "General Discussion" topic
    Then both should see "General Discussion" as highlighted/selected
    
    When Alice types "Hello Bob! Welcome to MessagePedia" and presses Enter
    Then Alice should see her message appear immediately in her chat
    And the message should be sent via WebRTC data channel
    And Bob should receive the message in real-time
    And Bob should see "Alice: Hello Bob! Welcome to MessagePedia" with timestamp
    And Alice's message should be stored in alice.db
    And Bob's copy should be stored in bob.db

    When Bob replies "Hi Alice! This WebRTC connection is working great!"
    Then Bob should see his message in his chat
    And Alice should receive Bob's reply via WebRTC
    And both should see the complete conversation thread
    And each message should be stored in respective local databases

  Scenario: File sharing workflow with P2P transfer
    Given Alice and Bob are in "General Discussion" with active WebRTC connection
    When Alice creates a test file "shared-document.txt" with content "This is a test document for P2P sharing"
    And Alice drags the file into her MessagePedia chat window
    Then Alice should see "📎 Shared file: shared-document.txt (45B)" in her chat
    And the file metadata should be stored in alice.db
    And a file offer should be broadcast via WebRTC data channel
    
    Then Bob should receive the file offer notification
    And Bob should see "📎 Alice shared: shared-document.txt (45B) - Click to download" in his chat
    When Bob clicks on the download link
    Then the file should be transferred via WebRTC data channel (not file system)
    And Bob should receive the complete file with correct content
    And Bob should see "Download complete" notification
    And the file should be available in Bob's local system

  Scenario: Multi-topic communication and context switching
    Given Alice and Bob are connected and in "General Discussion"
    When Alice sends "General chat message" in "General Discussion"
    And Alice switches to "Tech Talk" topic
    And Alice sends "Technical discussion message" in "Tech Talk"
    Then Bob (still in "General Discussion") should only see the general message
    And Bob should not receive the tech talk message
    
    When Bob switches to "Tech Talk"
    Then Bob should see Alice's technical message
    And Bob should not see general messages in the Tech Talk view
    When Bob switches back to "General Discussion"
    Then Bob should see the general message history
    And the tech talk message should not appear

  Scenario: Connection resilience and recovery
    Given Alice and Bob are actively communicating via WebRTC
    When Bob's internet connection is temporarily interrupted
    Then Alice should see Bob's status change to "🔴 Offline"
    And Alice's messages should queue locally
    And Alice should see "Connection Lost" notification
    
    When Bob's connection is restored
    Then WebRTC connection should be reestablished automatically
    And Alice should see Bob's status return to "🟢 Online"
    And queued messages should be transmitted
    And real-time communication should resume