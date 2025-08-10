const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');

/**
 * TopicManager - Manages topic-based message organization with AI readiness
 * 
 * Features:
 * - Topic creation, joining, leaving
 * - Message routing to topic members
 * - Message persistence and sync
 * - AI integration hooks for future enhancements
 * - Smart message classification and topic suggestions
 */
class TopicManager extends EventEmitter {
  constructor(p2pNetworkManager, database) {
    super();
    this.p2pManager = p2pNetworkManager;
    this.database = database;
    this.topics = new Map(); // topicId -> Topic
    this.userTopics = new Map(); // userId -> Set<topicId>
    this.messageHandlers = new Map(); // messageType -> handler function
    
    // AI-ready message processing pipeline
    this.messageProcessors = new Map(); // processor name -> function
    this.setupDefaultProcessors();
    
    // Setup P2P message handling
    this.setupP2PHandlers();
  }

  /**
   * Setup default message processors (AI integration points)
   */
  setupDefaultProcessors() {
    // Basic processors that can be enhanced with AI later
    this.messageProcessors.set('content-filter', this.contentFilter.bind(this));
    this.messageProcessors.set('topic-classifier', this.topicClassifier.bind(this));
    this.messageProcessors.set('smart-search-indexer', this.smartSearchIndexer.bind(this));
    this.messageProcessors.set('relationship-tracker', this.relationshipTracker.bind(this));
    
    // Placeholder for AI processors (to be added later)
    this.messageProcessors.set('ai-translator', this.placeholderAIProcessor.bind(this));
    this.messageProcessors.set('ai-summarizer', this.placeholderAIProcessor.bind(this));
    this.messageProcessors.set('sentiment-analyzer', this.placeholderAIProcessor.bind(this));
  }

  /**
   * Setup P2P network message handlers
   */
  setupP2PHandlers() {
    this.p2pManager.on('message', async (data) => {
      await this.handleIncomingMessage(data.peerId, data.message);
    });
    
    this.p2pManager.on('peer-connected', async (data) => {
      await this.syncTopicsWithPeer(data.peerId);
    });
  }

  /**
   * Create a new topic
   */
  async createTopic(name, options = {}) {
    const topicId = uuidv4();
    const topic = {
      id: topicId,
      name: name,
      creator: this.p2pManager.peerId,
      created: Date.now(),
      isPrivate: options.isPrivate || false,
      members: new Set([this.p2pManager.peerId]),
      messages: [],
      metadata: {
        description: options.description || '',
        tags: options.tags || [],
        aiClassification: null, // Will be filled by AI classifier
        lastActivity: Date.now()
      }
    };
    
    // AI-ready processing
    await this.processTopicWithAI(topic);
    
    // Store locally
    this.topics.set(topicId, topic);
    await this.database.storeTopic(topic);
    
    // Add to user's topic list
    if (!this.userTopics.has(this.p2pManager.peerId)) {
      this.userTopics.set(this.p2pManager.peerId, new Set());
    }
    this.userTopics.get(this.p2pManager.peerId).add(topicId);
    
    // Announce to network if public
    if (!topic.isPrivate) {
      this.p2pManager.broadcastMessage('topic-created', {
        topic: this.getTopicSummary(topic)
      });
    }
    
    this.emit('topic-created', { topicId, topic });
    console.log(`📝 Created topic: ${name} (${topicId})`);
    
    return topicId;
  }

  /**
   * Join an existing topic
   */
  async joinTopic(topicId, inviteCode = null) {
    let topic = this.topics.get(topicId);
    
    if (!topic) {
      // Request topic info from network
      topic = await this.discoverTopic(topicId);
      if (!topic) {
        throw new Error(`Topic ${topicId} not found`);
      }
    }
    
    // Check access permissions
    if (topic.isPrivate && !this.canAccessPrivateTopic(topic, inviteCode)) {
      throw new Error('Access denied to private topic');
    }
    
    // Add member
    topic.members.add(this.p2pManager.peerId);
    
    // Store/update locally
    this.topics.set(topicId, topic);
    await this.database.storeTopic(topic);
    
    // Add to user's topic list
    if (!this.userTopics.has(this.p2pManager.peerId)) {
      this.userTopics.set(this.p2pManager.peerId, new Set());
    }
    this.userTopics.get(this.p2pManager.peerId).add(topicId);
    
    // Notify other members
    const connectedMembers = this.getConnectedMembers(topic);
    connectedMembers.forEach(peerId => {
      this.p2pManager.sendMessage(peerId, 'member-joined', {
        topicId,
        peerId: this.p2pManager.peerId
      });
    });
    
    // Sync message history
    await this.syncTopicHistory(topicId);
    
    this.emit('topic-joined', { topicId, topic });
    console.log(`🚪 Joined topic: ${topic.name} (${topicId})`);
    
    return true;
  }

  /**
   * Send a message to a topic
   */
  async sendMessage(topicId, content, options = {}) {
    const topic = this.topics.get(topicId);
    if (!topic) {
      throw new Error(`Topic ${topicId} not found`);
    }
    
    if (!topic.members.has(this.p2pManager.peerId)) {
      throw new Error('Not a member of this topic');
    }
    
    const messageId = uuidv4();
    const message = {
      id: messageId,
      topicId,
      sender: this.p2pManager.peerId,
      content,
      timestamp: Date.now(),
      type: options.type || 'text',
      attachments: options.attachments || [],
      replyTo: options.replyTo || null,
      metadata: {
        edited: false,
        editHistory: [],
        reactions: new Map(),
        aiAnalysis: {} // AI analysis results will be stored here
      }
    };
    
    // AI-ready message processing pipeline
    await this.processMessageWithAI(message, topic);
    
    // Store locally
    topic.messages.push(message);
    topic.metadata.lastActivity = Date.now();
    await this.database.storeMessage(message);
    
    // Send to connected members
    const connectedMembers = this.getConnectedMembers(topic);
    const deliveryPromises = connectedMembers.map(peerId => {
      if (peerId !== this.p2pManager.peerId) {
        return this.p2pManager.sendMessage(peerId, 'topic-message', {
          topicId,
          message
        });
      }
    });
    
    // Track delivery status for AI optimization
    const deliveryResults = await Promise.allSettled(deliveryPromises);
    const deliveredCount = deliveryResults.filter(r => r.status === 'fulfilled').length;
    
    console.log(`📨 Message sent to ${deliveredCount}/${connectedMembers.length - 1} members`);
    
    this.emit('message-sent', { 
      messageId, 
      topicId, 
      message, 
      deliveredCount,
      totalMembers: topic.members.size 
    });
    
    return messageId;
  }

  /**
   * Handle incoming P2P message
   */
  async handleIncomingMessage(fromPeerId, message) {
    switch (message.type) {
      case 'topic-message':
        await this.handleTopicMessage(fromPeerId, message.data);
        break;
      case 'topic-created':
        await this.handleTopicCreated(fromPeerId, message.data);
        break;
      case 'member-joined':
        await this.handleMemberJoined(fromPeerId, message.data);
        break;
      case 'topic-sync-request':
        await this.handleTopicSyncRequest(fromPeerId, message.data);
        break;
      default:
        console.warn(`Unknown message type: ${message.type}`);
    }
  }

  /**
   * Handle incoming topic message
   */
  async handleTopicMessage(fromPeerId, data) {
    const { topicId, message } = data;
    const topic = this.topics.get(topicId);
    
    if (!topic) {
      console.warn(`Received message for unknown topic: ${topicId}`);
      return;
    }
    
    if (!topic.members.has(fromPeerId)) {
      console.warn(`Received message from non-member: ${fromPeerId}`);
      return;
    }
    
    // Check for duplicate messages
    if (topic.messages.find(m => m.id === message.id)) {
      return; // Already have this message
    }
    
    // AI-ready message processing
    await this.processMessageWithAI(message, topic);
    
    // Store message
    topic.messages.push(message);
    topic.messages.sort((a, b) => a.timestamp - b.timestamp); // Maintain order
    topic.metadata.lastActivity = Date.now();
    
    await this.database.storeMessage(message);
    
    this.emit('message-received', { topicId, message, fromPeerId });
  }

  /**
   * AI-ready message processing pipeline
   */
  async processMessageWithAI(message, topic) {
    // Run all message processors
    for (const [name, processor] of this.messageProcessors) {
      try {
        const result = await processor(message, topic);
        if (result) {
          message.metadata.aiAnalysis[name] = result;
        }
      } catch (error) {
        console.warn(`Message processor ${name} failed:`, error);
      }
    }
  }

  /**
   * AI-ready topic processing
   */
  async processTopicWithAI(topic) {
    // Topic classification (can be enhanced with AI)
    const classification = await this.classifyTopic(topic);
    topic.metadata.aiClassification = classification;
    
    // Generate suggested tags
    const suggestedTags = await this.generateTopicTags(topic);
    topic.metadata.suggestedTags = suggestedTags;
  }

  /**
   * Content filter processor (can be enhanced with AI)
   */
  async contentFilter(message, topic) {
    // Basic content filtering - can be replaced with AI-based filtering
    const flaggedWords = ['spam', 'inappropriate']; // Placeholder
    const hasFlag = flaggedWords.some(word => 
      message.content.toLowerCase().includes(word)
    );
    
    return {
      flagged: hasFlag,
      confidence: hasFlag ? 0.8 : 0.1,
      reason: hasFlag ? 'Contains flagged content' : null
    };
  }

  /**
   * Topic classifier processor (AI integration point)
   */
  async topicClassifier(message, topic) {
    // Simple classification - can be replaced with AI
    const categories = ['technical', 'casual', 'business', 'personal'];
    const techKeywords = ['code', 'bug', 'feature', 'deploy'];
    
    const isTechnical = techKeywords.some(keyword => 
      message.content.toLowerCase().includes(keyword)
    );
    
    return {
      category: isTechnical ? 'technical' : 'casual',
      confidence: 0.6,
      suggestedTags: isTechnical ? ['technical'] : ['casual']
    };
  }

  /**
   * Smart search indexer (AI integration point)
   */
  async smartSearchIndexer(message, topic) {
    // Extract key terms and concepts for search
    const words = message.content.toLowerCase().split(/\s+/);
    const keyTerms = words.filter(word => word.length > 3); // Simple extraction
    
    return {
      keyTerms,
      searchableContent: message.content.toLowerCase(),
      concepts: [], // AI can extract concepts here
      entities: [] // AI can extract named entities
    };
  }

  /**
   * Relationship tracker (AI integration point)
   */
  async relationshipTracker(message, topic) {
    // Track interaction patterns between users
    return {
      mentions: this.extractMentions(message.content),
      replyPattern: message.replyTo ? 'reply' : 'original',
      interactionScore: 1 // AI can calculate relationship strength
    };
  }

  /**
   * Placeholder for AI processors
   */
  async placeholderAIProcessor(message, topic) {
    // This is where future AI processors will be integrated
    return {
      available: false,
      note: 'AI processor not yet implemented'
    };
  }

  /**
   * Smart search across topics (AI-ready)
   */
  async searchMessages(query, options = {}) {
    const results = [];
    const queryLower = query.toLowerCase();
    
    for (const [topicId, topic] of this.topics) {
      // Check if user has access to topic
      if (!topic.members.has(this.p2pManager.peerId)) continue;
      
      for (const message of topic.messages) {
        // Basic text search - can be enhanced with AI semantic search
        if (message.content.toLowerCase().includes(queryLower)) {
          results.push({
            messageId: message.id,
            topicId,
            topicName: topic.name,
            message,
            relevanceScore: this.calculateRelevanceScore(message, query),
            // AI analysis results can enhance search relevance
            aiContext: message.metadata.aiAnalysis
          });
        }
      }
    }
    
    // Sort by relevance (AI can improve ranking)
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    return results.slice(0, options.limit || 50);
  }

  /**
   * Calculate search relevance score (AI integration point)
   */
  calculateRelevanceScore(message, query) {
    // Simple scoring - AI can make this much more sophisticated
    const content = message.content.toLowerCase();
    const queryTerms = query.toLowerCase().split(/\s+/);
    
    let score = 0;
    queryTerms.forEach(term => {
      const matches = (content.match(new RegExp(term, 'g')) || []).length;
      score += matches;
    });
    
    // Boost recent messages
    const ageHours = (Date.now() - message.timestamp) / (1000 * 60 * 60);
    if (ageHours < 24) score *= 1.5;
    if (ageHours < 1) score *= 2;
    
    return score;
  }

  /**
   * Get AI-powered conversation insights
   */
  async getConversationInsights(topicId, timeframe = '7d') {
    const topic = this.topics.get(topicId);
    if (!topic) return null;
    
    const cutoff = Date.now() - this.parseTimeframe(timeframe);
    const recentMessages = topic.messages.filter(m => m.timestamp > cutoff);
    
    // Basic insights - can be greatly enhanced with AI
    const insights = {
      messageCount: recentMessages.length,
      activeMembers: new Set(recentMessages.map(m => m.sender)).size,
      averageMessageLength: recentMessages.reduce((sum, m) => sum + m.content.length, 0) / recentMessages.length,
      topKeywords: this.extractTopKeywords(recentMessages),
      activityPattern: this.analyzeActivityPattern(recentMessages),
      // AI-enhanced insights
      sentiment: 'neutral', // AI sentiment analysis
      topics: [], // AI topic extraction
      relationshipMap: {}, // AI relationship analysis
      suggestions: [] // AI-powered suggestions
    };
    
    return insights;
  }

  /**
   * Extract mentions from message content
   */
  extractMentions(content) {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  }

  /**
   * Get connected members of a topic
   */
  getConnectedMembers(topic) {
    const connectedPeers = this.p2pManager.getConnectedPeers();
    return Array.from(topic.members).filter(peerId => 
      connectedPeers.includes(peerId) || peerId === this.p2pManager.peerId
    );
  }

  /**
   * Get topic summary for sharing
   */
  getTopicSummary(topic) {
    return {
      id: topic.id,
      name: topic.name,
      creator: topic.creator,
      created: topic.created,
      isPrivate: topic.isPrivate,
      memberCount: topic.members.size,
      lastActivity: topic.metadata.lastActivity,
      description: topic.metadata.description,
      tags: topic.metadata.tags
    };
  }

  /**
   * AI-ready topic discovery
   */
  async discoverTopic(topicId) {
    // Request topic from connected peers
    const connectedPeers = this.p2pManager.getConnectedPeers();
    
    for (const peerId of connectedPeers) {
      try {
        const response = await this.requestTopicInfo(peerId, topicId);
        if (response && response.topic) {
          return response.topic;
        }
      } catch (error) {
        console.warn(`Failed to get topic info from ${peerId}:`, error);
      }
    }
    
    return null;
  }

  /**
   * Sync topics with a peer
   */
  async syncTopicsWithPeer(peerId) {
    // Send our public topic list
    const publicTopics = Array.from(this.topics.values())
      .filter(topic => !topic.isPrivate && topic.members.has(this.p2pManager.peerId))
      .map(topic => this.getTopicSummary(topic));
    
    this.p2pManager.sendMessage(peerId, 'topic-sync', {
      topics: publicTopics
    });
  }

  /**
   * Get user's topics with AI insights
   */
  getUserTopics(userId = null) {
    const targetUserId = userId || this.p2pManager.peerId;
    const userTopicIds = this.userTopics.get(targetUserId) || new Set();
    
    const topics = Array.from(userTopicIds)
      .map(topicId => this.topics.get(topicId))
      .filter(Boolean)
      .map(topic => ({
        ...this.getTopicSummary(topic),
        unreadCount: this.getUnreadMessageCount(topic.id),
        recentActivity: this.getRecentActivity(topic),
        aiInsights: topic.metadata.aiClassification
      }));
    
    // Sort by last activity (AI can improve this ranking)
    return topics.sort((a, b) => b.lastActivity - a.lastActivity);
  }

  /**
   * Get unread message count for a topic
   */
  getUnreadMessageCount(topicId) {
    // This would track read status - simplified for now
    return 0;
  }

  /**
   * Get recent activity summary
   */
  getRecentActivity(topic) {
    const recentMessages = topic.messages
      .slice(-5)
      .map(m => ({
        sender: m.sender,
        timestamp: m.timestamp,
        preview: m.content.substring(0, 50) + '...'
      }));
    
    return recentMessages;
  }

  // Helper methods for AI integration
  parseTimeframe(timeframe) {
    const units = { d: 24 * 60 * 60 * 1000, h: 60 * 60 * 1000, m: 60 * 1000 };
    const match = timeframe.match(/(\d+)([dhm])/);
    if (match) {
      return parseInt(match[1]) * units[match[2]];
    }
    return 24 * 60 * 60 * 1000; // Default 1 day
  }

  extractTopKeywords(messages) {
    // Simple keyword extraction - AI can make this much better
    const allWords = messages
      .map(m => m.content.toLowerCase())
      .join(' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const wordCount = {};
    allWords.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));
  }

  analyzeActivityPattern(messages) {
    // Analyze when messages are sent - AI can find complex patterns
    const hourCounts = new Array(24).fill(0);
    messages.forEach(m => {
      const hour = new Date(m.timestamp).getHours();
      hourCounts[hour]++;
    });
    
    return {
      peakHour: hourCounts.indexOf(Math.max(...hourCounts)),
      distribution: hourCounts
    };
  }

  async classifyTopic(topic) {
    // Placeholder for AI topic classification
    return {
      category: 'general',
      confidence: 0.5,
      reasoning: 'Default classification'
    };
  }

  async generateTopicTags(topic) {
    // Placeholder for AI tag generation
    const words = topic.name.toLowerCase().split(/\s+/);
    return words.filter(word => word.length > 2);
  }

  canAccessPrivateTopic(topic, inviteCode) {
    // Simplified access control - can be enhanced
    return inviteCode === 'test-invite'; // Placeholder
  }
}

module.exports = TopicManager;
