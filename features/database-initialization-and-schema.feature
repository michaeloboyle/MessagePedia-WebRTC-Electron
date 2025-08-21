# MessagePedia Database Operations

Feature: Database Initialization and Schema
  As a MessagePedia instance
  I need reliable database operations
  So that messages, peers, and files are properly stored and retrieved

  Background:
    Given MessagePedia starts with database path "test.db"

  Scenario: Database schema creation
    When the database is initialized
    Then all required tables should be created: peers, topics, topic_members, messages, files, file_chunks, settings, connections
    And foreign key constraints should be enabled
    And WAL journal mode should be activated
    And the database should be ready for operations

  Scenario: Database file isolation per instance
    Given Alice starts with database path "alice.db"
    And Bob starts with database path "bob.db"
    When both instances are running
    Then Alice's data should be stored only in "alice.db"
    And Bob's data should be stored only in "bob.db"
    And neither should interfere with the other's data