const TopicManager = require('../../../src/services/topics/TopicManager');

// Mock dependencies
const mockP2PManager = {
  peerId: 'test-peer-123',
  getConnectedPeers: jest.fn(() => ['peer-1', 'peer-2']),
  broadcastMessage: jest.fn(),
  sendMessage: jest.fn(() => true),
  on: jest.fn(),
  emit: jest.fn()
};

const mockDatabase = {
  storeTopic: jest.fn(() => Promise.resolve()),
  storeMessage: jest.fn(() => Promise.resolve()),
  getTopics: jest.fn(() => Promise.resolve([])),
  getMessages: jest.fn(() => Promise.resolve([]))
};

describe('TopicManager', () => {
  let topicManager;

  beforeEach(() => {
    topicManager = new TopicManager(mockP2PManager, mockDatabase);
    jest.clearAllMocks();
  });

  describe('Topic Creation', () => {
    test('should create a public topic', async () => {
      const topicId = await topicManager.createTopic('Test Topic', {
        description: 'A test topic'
      });
      
      expect(typeof topicId).toBe('string');
      expect(topicManager.topics.has(topicId)).toBe(true);
      
      const topic = topicManager.topics.get(topicId);
      expect(topic.name).toBe('Test Topic');
      expect(topic.creator).toBe('test-peer-123');
      expect(topic.isPrivate).toBe(false);
      expect(topic.members.has('test-peer-123')).toBe(true);
      
      expect(mockDatabase.storeTopic).toHaveBeenCalledWith(topic);
      expect(mockP2PManager.broadcastMessage).toHaveBeenCalledWith(
        'topic-created', 
        expect.objectContaining({
          topic: expect.objectContaining({ name: 'Test Topic' })
        })
      );
    });

    test('should create a private topic', async () => {
      const topicId = await topicManager.createTopic('Private Topic', {
        isPrivate: true,
        description: 'A private topic'
      });
      
      const topic = topicManager.topics.get(topicId);
      expect(topic.isPrivate).toBe(true);
      
      // Private topics should not be broadcasted
      expect(mockP2PManager.broadcastMessage).not.toHaveBeenCalled();
    });

    test('should add topic to user topics list', async () => {
      const topicId = await topicManager.createTopic('Test Topic');
      
      const userTopics = topicManager.userTopics.get('test-peer-123');
      expect(userTopics.has(topicId)).toBe(true);
    });
  });

  describe('Topic Joining', () => {
    let topicId;

    beforeEach(async () => {
      topicId = await topicManager.createTopic('Join Test Topic');
    });

    test('should join existing topic', async () => {
      // Simulate different user
      const anotherManager = new TopicManager({
        ...mockP2PManager,
        peerId: 'other-peer-456'
      }, mockDatabase);
      
      // Share the topic
      anotherManager.topics.set(topicId, topicManager.topics.get(topicId));
      
      const result = await anotherManager.joinTopic(topicId);
      expect(result).toBe(true);
      
      const topic = anotherManager.topics.get(topicId);
      expect(topic.members.has('other-peer-456')).toBe(true);
    });

    test('should reject joining private topic without invite', async () => {
      const privateTopicId = await topicManager.createTopic('Private Topic', {
        isPrivate: true
      });
      
      const anotherManager = new TopicManager({
        ...mockP2PManager,
        peerId: 'other-peer-456'
      }, mockDatabase);
      
      anotherManager.topics.set(privateTopicId, topicManager.topics.get(privateTopicId));
      
      await expect(anotherManager.joinTopic(privateTopicId))
        .rejects.toThrow('Access denied to private topic');
    });
  });

  describe('Message Sending', () => {
    let topicId;

    beforeEach(async () => {
      topicId = await topicManager.createTopic('Message Test Topic');
    });

    test('should send message to topic', async () => {
      const messageId = await topicManager.sendMessage(
        topicId, 
        'Hello, world!', 
        { type: 'text' }
      );
      
      expect(typeof messageId).toBe('string');
      
      const topic = topicManager.topics.get(topicId);
      expect(topic.messages).toHaveLength(1);
      
      const message = topic.messages[0];
      expect(message.content).toBe('Hello, world!');
      expect(message.sender).toBe('test-peer-123');
      expect(message.topicId).toBe(topicId);
      
      expect(mockDatabase.storeMessage).toHaveBeenCalledWith(message);
    });

    test('should reject message from non-member', async () => {
      const anotherManager = new TopicManager({
        ...mockP2PManager,
        peerId: 'non-member-789'
      }, mockDatabase);
      
      await expect(
        anotherManager.sendMessage(topicId, 'Unauthorized message')
      ).rejects.toThrow('Not a member of this topic');
    });

    test('should process message with AI pipeline', async () => {
      const messageId = await topicManager.sendMessage(
        topicId, 
        'This is a test message with code'
      );
      
      const topic = topicManager.topics.get(topicId);
      const message = topic.messages[0];
      
      // Check that AI processors ran
      expect(message.metadata.aiAnalysis).toBeDefined();
      expect(message.metadata.aiAnalysis['content-filter']).toBeDefined();
      expect(message.metadata.aiAnalysis['topic-classifier']).toBeDefined();
      expect(message.metadata.aiAnalysis['smart-search-indexer']).toBeDefined();
    });
  });

  describe('AI-Ready Features', () => {
    let topicId;

    beforeEach(async () => {
      topicId = await topicManager.createTopic('AI Test Topic');
      // Add some test messages
      await topicManager.sendMessage(topicId, 'Hello everyone!');
      await topicManager.sendMessage(topicId, 'This is about code and bugs');
      await topicManager.sendMessage(topicId, 'Casual conversation here');
    });

    test('should classify messages with AI processors', async () => {
      const topic = topicManager.topics.get(topicId);
      const technicalMessage = topic.messages.find(m => m.content.includes('code'));
      
      expect(technicalMessage.metadata.aiAnalysis['topic-classifier']).toEqual({
        category: 'technical',
        confidence: 0.6,
        suggestedTags: ['technical']
      });
    });

    test('should perform smart search', async () => {
      const results = await topicManager.searchMessages('code');
      
      expect(results).toHaveLength(1);
      expect(results[0].message.content).toContain('code');
      expect(results[0].topicId).toBe(topicId);
      expect(results[0].relevanceScore).toBeGreaterThan(0);
    });

    test('should generate conversation insights', async () => {
      const insights = await topicManager.getConversationInsights(topicId);
      
      expect(insights).toBeDefined();
      expect(insights.messageCount).toBe(3);
      expect(insights.activeMembers).toBe(1);
      expect(insights.topKeywords).toBeDefined();
      expect(insights.activityPattern).toBeDefined();
    });

    test('should extract mentions from messages', () => {
      const mentions = topicManager.extractMentions('Hello @john and @jane');
      expect(mentions).toEqual(['john', 'jane']);
    });

    test('should calculate message relevance score', () => {
      const message = { 
        content: 'This is about code and programming',
        timestamp: Date.now() - 1000 // Recent message
      };
      
      const score = topicManager.calculateRelevanceScore(message, 'code programming');
      expect(score).toBeGreaterThan(0);
    });
  });

  describe('Topic Management', () => {
    test('should get user topics with AI insights', async () => {
      const topicId1 = await topicManager.createTopic('Topic 1');
      const topicId2 = await topicManager.createTopic('Topic 2');
      
      const userTopics = topicManager.getUserTopics();
      
      expect(userTopics).toHaveLength(2);
      userTopics.forEach(topic => {
        expect(topic).toHaveProperty('unreadCount');
        expect(topic).toHaveProperty('recentActivity');
        expect(topic).toHaveProperty('aiInsights');
      });
    });

    test('should get connected members', async () => {
      const topicId = await topicManager.createTopic('Connected Test');
      const topic = topicManager.topics.get(topicId);
      
      // Add some members
      topic.members.add('peer-1');
      topic.members.add('peer-2');
      topic.members.add('offline-peer');
      
      const connectedMembers = topicManager.getConnectedMembers(topic);
      expect(connectedMembers).toEqual(['test-peer-123', 'peer-1', 'peer-2']);
    });
  });

  describe('Message Processors', () => {
    test('content filter should flag inappropriate content', async () => {
      const message = { content: 'This contains spam content', metadata: { aiAnalysis: {} } };
      const topic = { name: 'Test Topic' };
      
      const result = await topicManager.contentFilter(message, topic);
      
      expect(result.flagged).toBe(true);
      expect(result.confidence).toBe(0.8);
      expect(result.reason).toContain('flagged content');
    });

    test('topic classifier should identify technical content', async () => {
      const message = { content: 'Found a bug in the code deployment', metadata: { aiAnalysis: {} } };
      const topic = { name: 'Dev Topic' };
      
      const result = await topicManager.topicClassifier(message, topic);
      
      expect(result.category).toBe('technical');
      expect(result.suggestedTags).toContain('technical');
    });

    test('search indexer should extract key terms', async () => {
      const message = { content: 'This message contains important keywords for search', metadata: { aiAnalysis: {} } };
      const topic = { name: 'Search Topic' };
      
      const result = await topicManager.smartSearchIndexer(message, topic);
      
      expect(result.keyTerms).toContain('important');
      expect(result.keyTerms).toContain('keywords');
      expect(result.searchableContent).toBe(message.content.toLowerCase());
    });
  });
});
