const DatabaseManager = require('../../../src/database/DatabaseManager');
const fs = require('fs');
const path = require('path');

describe('DatabaseManager', () => {
    let dbManager;
    const testDbPath = './test-messagepedia.db';

    beforeEach(async () => {
        // Clean up any existing test database
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }
        
        dbManager = new DatabaseManager(testDbPath);
        await dbManager.initialize();
    });

    afterEach(async () => {
        if (dbManager) {
            await dbManager.close();
        }
        
        // Clean up test database
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }
    });

    describe('Initialization', () => {
        test('should initialize database successfully', () => {
            expect(dbManager.isInitialized).toBe(true);
            expect(fs.existsSync(testDbPath)).toBe(true);
        });
    });

    describe('Peer Operations', () => {
        test('should store and retrieve peer', async () => {
            const peer = {
                id: 'peer-123',
                displayName: 'Test Peer',
                publicKey: 'test-key',
                lastSeen: Date.now(),
                isOnline: true,
                reputationScore: 95
            };

            await dbManager.storePeer(peer);
            const retrieved = await dbManager.getPeer(peer.id);

            expect(retrieved.id).toBe(peer.id);
            expect(retrieved.display_name).toBe(peer.displayName);
            expect(retrieved.public_key).toBe(peer.publicKey);
            expect(retrieved.is_online).toBe(1);
            expect(retrieved.reputation_score).toBe(peer.reputationScore);
        });

        test('should get all peers', async () => {
            const peers = [
                { id: 'peer-1', displayName: 'Peer 1', isOnline: true },
                { id: 'peer-2', displayName: 'Peer 2', isOnline: false }
            ];

            for (const peer of peers) {
                await dbManager.storePeer(peer);
            }

            const allPeers = await dbManager.getAllPeers();
            expect(allPeers).toHaveLength(2);
        });

        test('should get only online peers', async () => {
            const peers = [
                { id: 'peer-1', displayName: 'Peer 1', isOnline: true },
                { id: 'peer-2', displayName: 'Peer 2', isOnline: false }
            ];

            for (const peer of peers) {
                await dbManager.storePeer(peer);
            }

            const onlinePeers = await dbManager.getOnlinePeers();
            expect(onlinePeers).toHaveLength(1);
            expect(onlinePeers[0].id).toBe('peer-1');
        });
    });

    describe('Topic Operations', () => {
        test('should store and retrieve topic', async () => {
            // First create the peer that will be the topic creator
            await dbManager.storePeer({
                id: 'peer-123',
                displayName: 'Creator Peer',
                isOnline: true
            });

            const topic = {
                id: 'topic-123',
                name: 'Test Topic',
                description: 'A test topic',
                creator: 'peer-123',
                isPrivate: false,
                lastActivity: Date.now()
            };

            await dbManager.storeTopic(topic);
            const retrieved = await dbManager.getTopic(topic.id);

            expect(retrieved.id).toBe(topic.id);
            expect(retrieved.name).toBe(topic.name);
            expect(retrieved.description).toBe(topic.description);
            expect(retrieved.creator_peer_id).toBe(topic.creator);
            expect(retrieved.is_private).toBe(0);
        });

        test('should add topic members', async () => {
            // Create required peers first
            await dbManager.storePeer({
                id: 'peer-123',
                displayName: 'Creator Peer',
                isOnline: true
            });
            await dbManager.storePeer({
                id: 'peer-456',
                displayName: 'Member Peer',
                isOnline: true
            });

            const topic = {
                id: 'topic-123',
                name: 'Test Topic',
                creator: 'peer-123',
                isPrivate: false
            };

            await dbManager.storeTopic(topic);
            await dbManager.addTopicMember(topic.id, 'peer-456', 'member');

            const topics = await dbManager.getTopicsForPeer('peer-456');
            expect(topics).toHaveLength(1);
            expect(topics[0].id).toBe(topic.id);
        });
    });

    describe('Message Operations', () => {
        test('should store and retrieve messages', async () => {
            // Create required peer and topic first
            await dbManager.storePeer({
                id: 'peer-123',
                displayName: 'Sender Peer',
                isOnline: true
            });
            await dbManager.storeTopic({
                id: 'topic-123',
                name: 'Test Topic',
                creator: 'peer-123',
                isPrivate: false
            });

            const message = {
                id: 'msg-123',
                topicId: 'topic-123',
                sender: 'peer-123',
                content: 'Hello, world!',
                type: 'text',
                timestamp: Date.now()
            };

            await dbManager.storeMessage(message);
            const messages = await dbManager.getMessagesForTopic(message.topicId);

            expect(messages).toHaveLength(1);
            expect(messages[0].id).toBe(message.id);
            expect(messages[0].content).toBe(message.content);
        });

        test('should search messages by content', async () => {
            // Create required peers and topic first
            await dbManager.storePeer({
                id: 'peer-123',
                displayName: 'Sender 1',
                isOnline: true
            });
            await dbManager.storePeer({
                id: 'peer-456',
                displayName: 'Sender 2',
                isOnline: true
            });
            await dbManager.storeTopic({
                id: 'topic-123',
                name: 'Test Topic',
                creator: 'peer-123',
                isPrivate: false
            });

            const messages = [
                {
                    id: 'msg-1',
                    topicId: 'topic-123',
                    sender: 'peer-123',
                    content: 'Hello everyone!',
                    timestamp: Date.now()
                },
                {
                    id: 'msg-2',
                    topicId: 'topic-123',
                    sender: 'peer-456',
                    content: 'How are you doing?',
                    timestamp: Date.now()
                }
            ];

            for (const msg of messages) {
                await dbManager.storeMessage(msg);
            }

            const results = await dbManager.searchMessages('Hello');
            expect(results).toHaveLength(1);
            expect(results[0].content).toContain('Hello');
        });
    });

    describe('Settings Operations', () => {
        test('should store and retrieve settings', async () => {
            await dbManager.setSetting('test_setting', 'test_value');
            const value = await dbManager.getSetting('test_setting');
            expect(value).toBe('test_value');
        });

        test('should handle different setting types', async () => {
            await dbManager.setSetting('boolean_setting', true, 'boolean');
            await dbManager.setSetting('number_setting', 42, 'number');

            expect(await dbManager.getSetting('boolean_setting')).toBe(true);
            expect(await dbManager.getSetting('number_setting')).toBe(42);
        });

        test('should return default value for non-existent setting', async () => {
            const value = await dbManager.getSetting('non_existent', 'default');
            expect(value).toBe('default');
        });
    });

    describe('Database Stats', () => {
        test('should return database statistics', async () => {
            // Add some test data with proper foreign key relationships
            await dbManager.storePeer({ id: 'peer-1', displayName: 'Peer 1', isOnline: true });
            await dbManager.storeTopic({ id: 'topic-1', name: 'Topic 1', creator: 'peer-1', isPrivate: false });
            await dbManager.storeMessage({ 
                id: 'msg-1', 
                topicId: 'topic-1', 
                sender: 'peer-1', 
                content: 'Hello', 
                timestamp: Date.now() 
            });

            const stats = await dbManager.getStats();

            expect(stats.peers).toBe(1);
            expect(stats.topics).toBe(1);
            expect(stats.messages).toBe(1);
            expect(typeof stats.dbSize).toBe('number');
            expect(stats.dbSize).toBeGreaterThan(0);
        });
    });
});
