# MessagePedia End-to-End Integration Scenarios

Feature: Data Integrity and Consistency

  Scenario: Database independence verification
    Given Alice and Bob have been communicating and sharing files
    When both applications are closed
    And alice.db and bob.db are examined
    Then alice.db should contain Alice's messages and received messages from Bob
    And bob.db should contain Bob's messages and received messages from Alice
    And file metadata should be stored appropriately in each database
    And no data should be shared between the database files
    
    When Alice starts MessagePedia again with alice.db
    Then all previous messages and files should be restored
    And the conversation history should be complete and accurate

  Scenario: Message ordering and timestamp consistency
    Given Alice and Bob exchange multiple rapid messages
    When messages are sent quickly in both directions
    Then all messages should maintain chronological order
    And timestamps should be consistent and accurate
    And no messages should be lost or duplicated
    And both peers should see the same conversation flow