# MessagePedia User Interface Features

Feature: Topic Management and Selection

  Scenario: Default topic display
    When Alice starts MessagePedia
    Then she should see "General Discussion" and "Tech Talk" topics
    And each topic should show member count
    And "General Discussion" should be selected by default

  Scenario: Topic selection and persistence
    Given Alice has topics available
    When Alice clicks on "Tech Talk" topic
    Then "Tech Talk" should be visually selected (highlighted)
    And messages for "Tech Talk" should load
    And the selection should be saved as last selected topic
    When Alice restarts MessagePedia
    Then "Tech Talk" should still be selected

  Scenario: Topic switching with message loading
    Given Alice is in "General Discussion" with existing messages
    When Alice switches to "Tech Talk"
    Then the message area should clear
    And messages specific to "Tech Talk" should load
    And the message count should reflect the new topic