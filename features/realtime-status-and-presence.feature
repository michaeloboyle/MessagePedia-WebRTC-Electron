# MessagePedia - Secure P2P Messaging for The Collective Intelligence App

Feature: Real-time Status and Presence

  Scenario: Online/offline status via WebRTC
    Given Alice and Bob are connected via WebRTC
    When Bob closes his MessagePedia application
    Then Alice should see Bob's status change to "Offline"
    And the WebRTC connection should be properly closed
    When Bob reopens MessagePedia
    Then Alice should see Bob come back "Online"
    And WebRTC connection should be reestablished

  Scenario: Typing indicators via WebRTC
    Given Alice and Bob are connected in "General Discussion"
    When Alice starts typing a message
    Then Bob should see "Alice is typing..." indicator via WebRTC
    When Alice stops typing without sending
    Then the typing indicator should disappear after 3 seconds
    When Alice sends the message
    Then the typing indicator should immediately disappear