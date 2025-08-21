# MessagePedia - Secure P2P File Transfer for Professional Collaboration

Feature: Encrypted Peer-to-Peer File Transfer Without Cloud Storage
  As a professional service provider using The Collective Intelligence App
  I want to securely share sensitive documents with clients and colleagues
  So that we can collaborate on confidential content without cloud exposure or storage limits

  Background:
    Given Alice and Bob are both connected to MessagePedia
    And they can see each other in the "Connected Peers" list
    And they are both in the "General Discussion" topic

  Scenario: Alice shares a file with Bob
    Given Alice has a file called "document.pdf" (2.3KB)
    When Alice drags the file into her chat window
    Then Alice should see a file share message "📎 Shared file: document.pdf (2.3KB)" in her chat
    And Bob should receive a file offer notification "📎 Alice shared: document.pdf (2.3KB) - Click to download"
    And the file metadata should be stored in the database
    And the file should be available for download by Bob

  Scenario: Bob receives and downloads Alice's file
    Given Alice has shared a file "image.jpg" (150KB)
    And Bob can see the file offer in his chat
    When Bob clicks on the download link
    Then the file should be transferred from Alice to Bob
    And Bob should receive the complete file with correct size and content
    And Bob should see a download complete notification

  Scenario: File transfer with chunking
    Given Alice has a large file "video.mp4" (5.2MB)
    When Alice shares the file with Bob
    Then the file should be split into 64KB chunks
    And each chunk should be transferred separately
    And Bob should receive all chunks in the correct order
    And the file should be reassembled properly

  Scenario: Multiple file transfer
    Given Alice selects multiple files: "doc1.txt", "doc2.txt", "image.png"
    When Alice drags all files into the chat
    Then Alice should see separate share messages for each file
    And Bob should receive individual download offers for each file
    And each file should be transferable independently

  Scenario: File transfer UI feedback
    Given Alice is sharing a file "presentation.pptx" (8MB)
    When the transfer is in progress
    Then Alice should see upload progress indication
    And Bob should see download progress indication
    And both should see transfer completion status

  Scenario: Peer connection handling
    Given Alice and Bob are connected
    When Bob goes offline during a file transfer
    Then Alice should see a connection lost message
    And the file transfer should pause
    When Bob comes back online
    Then the file transfer should resume from where it left off

  Scenario: Topic-based file sharing
    Given Alice is in "Tech Talk" topic and Bob is in "General Discussion"
    When Alice shares a file in "Tech Talk"
    Then Bob should not see the file offer (since he's in a different topic)
    When Bob switches to "Tech Talk" topic
    Then Bob should see Alice's file offer