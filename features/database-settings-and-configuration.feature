# MessagePedia Database Operations

Feature: Database Settings and Configuration

  Scenario: Store and retrieve settings with type conversion
    Given the database is initialized
    When setting "max_file_size" is stored as number 50000000
    And setting "enable_notifications" is stored as boolean true
    And setting "theme_colors" is stored as JSON object
    Then retrieving "max_file_size" should return number 50000000
    And retrieving "enable_notifications" should return boolean true
    And retrieving "theme_colors" should return the correct JSON object

  Scenario: Setting default values
    Given a setting "unknown_setting" has never been stored
    When the setting is retrieved with default value "default_value"
    Then the default value should be returned
    And no database error should occur