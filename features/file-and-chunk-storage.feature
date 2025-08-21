# MessagePedia Database Operations

Feature: File and Chunk Storage

  Scenario: Store file metadata with chunking information
    Given a file "document.pdf" with size 150KB is shared
    When the file metadata is stored
    Then the file record should include: ID, name, size, MIME type, topic, sender
    And chunk_count should be calculated based on 64KB chunk size (3 chunks)
    And chunk_size should be set to 65536 bytes
    And created_at timestamp should be set

  Scenario: Store and retrieve file chunks
    Given a file with ID "file-123" exists in the database
    When file chunks 0, 1, and 2 are stored with binary data
    Then all chunks should be retrievable by file ID
    And chunks should be returned in correct order (0, 1, 2)
    And chunk data should be preserved exactly for reassembly

  Scenario: File chunk integrity and reassembly
    Given a file is split into multiple chunks
    When all chunks are stored and retrieved
    Then the reassembled file should have the exact same size and content
    And no data should be lost or corrupted during storage
    And chunk boundaries should be preserved