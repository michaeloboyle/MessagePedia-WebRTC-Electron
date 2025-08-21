# MessagePedia User Interface Features

Feature: Peer List Management

  Scenario: Display connected peers
    Given Alice and Bob are both online and connected
    When Alice views her peer list
    Then she should see "Bob" listed under "Connected Peers"
    And Bob's status should show "🟢 Online"
    And Bob's reputation score should be displayed
    And peers should be sorted by last seen time

  Scenario: Peer status indicators
    Given Bob is online and connected to Alice
    When Bob goes offline
    Then Alice should see Bob's status change to "🔴 Offline"
    When Bob comes back online
    Then Alice should see Bob's status change to "🟢 Online"

  Scenario: Empty peer list
    Given Alice starts MessagePedia with no other peers online
    When Alice views her peer list
    Then she should see "No peers found" message
    And the message should be styled in italic gray text