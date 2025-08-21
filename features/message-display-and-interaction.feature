# MessagePedia User Interface Features

Feature: Message Display and Interaction

  Scenario: Message rendering format
    Given Alice receives a message from Bob saying "Hello Alice!"
    When the message appears in the chat
    Then it should display "Bob" as the sender name
    And show the timestamp in local time format
    And show the message content "Hello Alice!"
    And use proper message styling with header and content sections

  Scenario: Own messages vs peer messages
    Given Alice sends "Hi Bob!" and Bob replies "Hi Alice!"
    When both messages are displayed
    Then Alice's message should show "Alice" as sender
    And Bob's message should show "Bob" as sender
    And both should have consistent formatting but distinguish sender

  Scenario: Empty topic message display
    Given Alice selects a topic with no messages
    When the message area loads
    Then it should show "No messages in this topic yet" in italic gray text
    And the message input should remain functional

  Scenario: Message scrolling and auto-scroll
    Given Alice has many messages in the current topic
    When new messages arrive
    Then the message area should auto-scroll to show the latest message
    And older messages should remain accessible by scrolling up