# MessagePedia - The Collective Intelligence App

Feature: Flexible File Management

  Scenario: Drag and Drop File Operations
    Given Alice has files on her computer that need to be shared in a Topic
    When Alice drags files from her computer into the Topic workspace
    Then the files should be shared with all Topic members
    And when Alice drags files out of the Topic to her computer
    Then local copies should be created while maintaining Topic versions
    And file operations should be intuitive and follow OS conventions
    And large files should transfer efficiently without timeout restrictions