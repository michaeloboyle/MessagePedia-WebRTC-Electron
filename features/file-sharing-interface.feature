# MessagePedia User Interface Features

Feature: File Sharing Interface

  Scenario: File share button visibility and functionality
    Given Alice is in a topic
    When Alice views the interface
    Then she should see a "📎 Share File" button
    When Alice clicks the file share button
    Then a file picker dialog should open
    And Alice should be able to select files

  Scenario: Drag and drop visual feedback
    Given Alice drags files over the message area
    When the files enter the drop zone
    Then a visual drop zone should appear
    And show "Drop files here to share" message
    And the drop zone should be highlighted
    When Alice drags files away
    Then the drop zone should disappear

  Scenario: File share message display
    Given Alice shares a file "document.pdf" (2.3KB)
    When the file is shared
    Then Alice should see "📎 Shared file: document.pdf (2.3KB)" in her chat
    And the message should be clearly marked as a file share
    And the file should be clickable for download