# MessagePedia - Secure P2P File Transfer for Professional Collaboration

Feature: File Transfer Security and Validation

  Scenario: File type validation
    Given Alice tries to share a file "malicious.exe"
    When the file has a restricted extension
    Then Alice should see a warning "File type not allowed"
    And the file should not be shared

  Scenario: File size limits
    Given Alice tries to share a file "huge_file.zip" (100MB)
    When the file exceeds the maximum size limit
    Then Alice should see "File too large. Maximum size is 50MB"
    And the file should not be shared

  Scenario: Storage management
    Given the database has limited storage space
    When storage is nearly full
    Then users should see a "Storage almost full" warning
    And older file chunks should be automatically cleaned up