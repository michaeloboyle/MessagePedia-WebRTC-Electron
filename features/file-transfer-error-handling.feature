# MessagePedia - Secure P2P File Transfer for Professional Collaboration

Feature: File Transfer Error Handling

  Scenario: Database errors during file storage
    Given the database is experiencing issues
    When Alice tries to share a file
    Then Alice should see "Failed to share file: Database error"
    And the file should not appear in Bob's chat

  Scenario: P2P bridge communication failure
    Given the P2P bridge file is corrupted
    When Alice shares a file
    Then the file offer should not reach Bob
    And Alice should see a warning about connectivity issues

  Scenario: Chunk transfer failure
    Given Alice is transferring a large file to Bob
    When some chunks fail to transfer
    Then the system should retry failed chunks automatically
    And Bob should only download the file when all chunks are received