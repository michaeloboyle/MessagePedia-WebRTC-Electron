# MessagePedia User Interface Features

Feature: Message Input and Sending

  Scenario: Text input functionality
    Given Alice is in a topic
    When Alice types in the message input field
    Then the text should appear in the input
    And the input should accept multi-line text
    And special characters should be handled properly

  Scenario: Send message via Enter key
    Given Alice types "Hello World" in the message input
    When Alice presses Enter
    Then the message should be sent
    And appear in the message area
    And the input field should be cleared
    And focus should remain on the input field

  Scenario: Send message via button click
    Given Alice types "Hello World" in the message input
    When Alice clicks the send button
    Then the message should be sent
    And appear in the message area
    And the input field should be cleared

  Scenario: Prevent sending empty messages
    Given the message input is empty
    When Alice presses Enter or clicks send
    Then no message should be sent
    And no empty message should appear in the chat

  Scenario: Prevent sending without topic selection
    Given no topic is currently selected
    When Alice tries to send a message
    Then the message should not be sent
    And Alice should be prompted to select a topic first