# MessagePedia Database Operations

Feature: Database Statistics and Monitoring

  Scenario: Collect database statistics
    Given the database contains: 3 peers, 2 topics, 15 messages, 5 files
    When database statistics are collected
    Then stats should show: peers: 3, topics: 2, messages: 15, files: 5
    And database file size should be included
    And all statistics should be accurate