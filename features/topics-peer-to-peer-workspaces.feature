# MessagePedia - The Collective Intelligence App

Feature: Topics - Peer-to-Peer Workspaces

  Scenario: Topic Creation and Ownership
    Given Alice wants to collaborate with trusted peers on a sensitive project
    When Alice creates a new Topic called "Client Project Alpha"
    Then Alice should become the Owner with complete control
    And the Topic should be end-to-end encrypted
    And only invited members should be able to access it
    And Alice should be able to Share/Unshare files, Post/Recall messages, and Add/Remove members

  Scenario: Role-Based Access Control in Topics
    Given Alice owns a Topic and invites Bob as a Contributor and Carol as a Reviewer
    When they access the Topic workspace
    Then Alice should have full Owner privileges (all actions)
    And Bob should be able to View files, Edit files, Share/Unshare files, and Post/Recall messages
    And Carol should only be able to View files and Post/Recall messages
    And Carol should NOT be able to Edit files or Share/Unshare files
    And any member should be able to Leave the Topic voluntarily

  Scenario: Large File Sharing in Topics
    Given Alice has a 1GB multimedia presentation to share with Topic members
    When Alice drags the presentation file into the Topic
    Then the file should be shared with all Topic members
    And there should be no file size restrictions
    And the file should be transmitted via encrypted P2P connections
    And members should be able to download and access the file locally

  Scenario: Cross-Organizational Topic Collaboration
    Given Alice works at Company A and wants to collaborate with external partners
    When Alice creates a Topic and invites Bob from Company B and Carol from Client C
    Then all members should be able to participate regardless of organization
    And security should be maintained across organizational boundaries
    And each organization's data sovereignty requirements should be respected
    And the collaboration should remain secure even with external participants

  Scenario: File Versioning and OS Integration
    Given Alice shares a document in a Topic that Bob needs to review and edit
    When Bob double-clicks the document in the Topic
    Then the document should open with its associated application on Bob's computer
    And when Bob modifies and saves the document
    Then a new version should be created and saved in the Topic
    And both old and new versions should be accessible to all Topic members
    And version history should be maintained within the Topic

  Scenario: Topic Lifecycle Management
    Given Alice owns a Topic that has completed its project phase
    When Alice decides to Archive the Topic
    Then all members should continue to have access to existing content
    And no one should be able to Share/Unshare new files
    And no one should be able to Post/Recall new messages
    And the Topic should remain frozen until Alice chooses to Unarchive it
    And when Alice Deletes the Topic, it should be permanently removed for everyone