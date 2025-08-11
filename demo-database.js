const DatabaseManager = require('./src/database/DatabaseManager');

async function runDemo() {
    console.log('🗄️ MessagePedia Database Demo');
    console.log('============================');
    
    const dbManager = new DatabaseManager('./demo.db');
    
    try {
        // Initialize database
        console.log('🔧 Initializing database...');
        await dbManager.initialize();
        
        // Add test peer
        console.log('👤 Adding test peer...');
        await dbManager.storePeer({
            id: 'peer-demo-123',
            displayName: 'Demo User',
            isOnline: true,
            reputationScore: 100
        });
        
        // Add test topic
        console.log('💬 Creating test topic...');
        await dbManager.storeTopic({
            id: 'topic-demo-456',
            name: 'Demo Chat Room',
            description: 'A demonstration chat room',
            creator: 'peer-demo-123',
            isPrivate: false
        });
        
        // Add topic member
        console.log('🤝 Adding peer to topic...');
        await dbManager.addTopicMember('topic-demo-456', 'peer-demo-123', 'owner');
        
        // Send test message
        console.log('📨 Sending test message...');
        await dbManager.storeMessage({
            id: 'msg-demo-789',
            topicId: 'topic-demo-456',
            sender: 'peer-demo-123',
            content: 'Hello from MessagePedia database!',
            timestamp: Date.now()
        });
        
        // Retrieve and display data
        console.log('\n📊 Database Contents:');
        
        const peers = await dbManager.getAllPeers();
        console.log(`👥 Peers: ${peers.length}`);
        peers.forEach(peer => {
            console.log(`  - ${peer.display_name} (${peer.id}) - Online: ${peer.is_online ? 'Yes' : 'No'}`);
        });
        
        const topics = await dbManager.getTopicsForPeer('peer-demo-123');
        console.log(`💬 Topics: ${topics.length}`);
        topics.forEach(topic => {
            console.log(`  - ${topic.name}: ${topic.description}`);
        });
        
        const messages = await dbManager.getMessagesForTopic('topic-demo-456');
        console.log(`📨 Messages: ${messages.length}`);
        messages.forEach(msg => {
            console.log(`  - ${msg.sender_name || msg.sender_peer_id}: ${msg.content}`);
        });
        
        // Search functionality
        console.log('\n🔍 Search Results for "Hello":');
        const searchResults = await dbManager.searchMessages('Hello');
        searchResults.forEach(result => {
            console.log(`  - Found in ${result.topic_name}: "${result.content}"`);
        });
        
        // Database statistics
        console.log('\n📈 Database Statistics:');
        const stats = await dbManager.getStats();
        console.log(`  - Peers: ${stats.peers}`);
        console.log(`  - Topics: ${stats.topics}`);
        console.log(`  - Messages: ${stats.messages}`);
        console.log(`  - Files: ${stats.files}`);
        console.log(`  - Database Size: ${Math.round(stats.dbSize / 1024)} KB`);
        
        console.log('\n✅ Demo completed successfully!');
        
    } catch (error) {
        console.error('❌ Demo failed:', error);
    } finally {
        await dbManager.close();
    }
}

runDemo();
