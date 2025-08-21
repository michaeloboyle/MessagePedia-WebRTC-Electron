# MessagePedia User Interface Features

Feature: Application Window and Layout
  As a MessagePedia user
  I want a clean, intuitive interface
  So that I can communicate effectively with peers

  Background:
    Given MessagePedia is started with peer name "Alice"

  Scenario: Window initialization and title
    When the application starts
    Then the window title should show "MessagePedia - Alice"
    And the main window should have proper layout with sidebars and main area
    And the connection status should show "Alice - Database Connected"

  Scenario: Responsive layout components
    Given the MessagePedia window is open
    Then I should see a "Connected Peers" sidebar on the left
    And I should see a "Topics" sidebar on the right
    And I should see a main chat area in the center
    And I should see a message input area at the bottom
    And I should see a file share button