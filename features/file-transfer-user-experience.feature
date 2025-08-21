# MessagePedia - Secure P2P File Transfer for Professional Collaboration

Feature: User Experience Requirements

  Scenario: Drag and drop file sharing
    Given Alice has files on her desktop
    When Alice drags files into the MessagePedia chat area
    Then a drop zone should appear with "Drop files here to share"
    And the files should be shared when dropped

  Scenario: File picker dialog
    Given Alice wants to share a file
    When Alice clicks the "📎 Share File" button
    Then a file picker dialog should open
    And Alice should be able to select multiple files
    And selected files should be shared immediately

  Scenario: Visual feedback and notifications
    Given Alice shares a file with Bob
    Then Alice should see the file in her chat with upload status
    And Bob should see a distinct file offer message
    And both should see real-time transfer progress
    And completion should be clearly indicated

  Scenario: File download management
    Given Bob receives multiple file offers
    When Bob clicks to download files
    Then downloads should be organized by sender and timestamp
    And Bob should be able to save files to chosen locations
    And download history should be maintained