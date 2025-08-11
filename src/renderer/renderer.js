// MessagePedia WebRTC + Electron Renderer Process
// Connected to working SQLite database with full CRUD operations

console.log('MessagePedia WebRTC + Electron Renderer Process - Database Connected!');

// Get peer configuration from environment/process args
const PEER_ID = process.env.MESSAGEPEDIA_PEER_ID || 'peer-default-001';
const PEER_NAME = process.env.MESSAGEPEDIA_PEER_NAME || 'Default User';
const DB_PATH = process.env.MESSAGEPEDIA_DB_PATH || './messagepedia.db';

const DatabaseManager = require('../database/DatabaseManager');
const SimpleP2PBridge = require('../services/SimpleP2PBridge');

const dbManager = new DatabaseManager(DB_PATH);
const p2pBridge = new SimpleP2PBridge(PEER_ID);

let currentTopic = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize database connection
        await dbManager.initialize();
        console.log('✅ Database connected successfully!');
        
        // Update connection status with peer info
        const statusEl = document.getElementById('connection-status');
        statusEl.textContent = `${PEER_NAME} - Database Connected`;
        statusEl.style.background = '#27ae60';
        
        // Update window title with peer info
        document.title = `MessagePedia - ${PEER_NAME}`;
        
        // Setup P2P bridge for real-time messaging
        setupP2PBridge();
        
        // Load and display data
        await loadPeers();
        await loadTopics();
        
        // Setup message input handler
        setupMessageInput();
        
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        const statusEl = document.getElementById('connection-status');
        statusEl.textContent = 'Database Error';
        statusEl.style.background = '#e74c3c';
    }
});

async function loadPeers() {
    try {
        const peers = await dbManager.getAllPeers();
        const peersSidebar = document.getElementById('peers-sidebar');
        
        // Clear existing content except title
        peersSidebar.innerHTML = '<h3>Connected Peers</h3>';
        
        if (peers.length === 0) {
            peersSidebar.innerHTML += '<p style="color: #7f8c8d; font-style: italic;">No peers found</p>';
            return;
        }
        
        peers.forEach(peer => {
            const peerEl = document.createElement('div');
            peerEl.className = 'peer-item';
            peerEl.innerHTML = `
                <div class="peer-name">${peer.display_name}</div>
                <div class="peer-status ${peer.is_online ? 'online' : 'offline'}">
                    ${peer.is_online ? '🟢 Online' : '🔴 Offline'}
                </div>
                <div class="peer-reputation">Rep: ${peer.reputation_score}</div>
            `;
            peersSidebar.appendChild(peerEl);
        });
        
        console.log(`✅ Loaded ${peers.length} peers`);
    } catch (error) {
        console.error('❌ Failed to load peers:', error);
    }
}

async function loadTopics() {
    try {
        const topics = await dbManager.getAllPeers(); // Get all topics (need to add this method)
        const topicsSidebar = document.getElementById('topics-sidebar');
        
        // For now, let's manually get topics since we don't have getAllTopics method
        // This is a demo showing the database connection works
        topicsSidebar.innerHTML = '<h3>Topics</h3>';
        
        // Add some demo topics (these should come from database)
        const demoTopics = [
            { id: 'topic-general-001', name: 'General Discussion', member_count: 2 },
            { id: 'topic-tech-002', name: 'Tech Talk', member_count: 1 }
        ];
        
        demoTopics.forEach(topic => {
            const topicEl = document.createElement('div');
            topicEl.className = 'topic-item';
            topicEl.innerHTML = `
                <div class="topic-name">${topic.name}</div>
                <div class="topic-members">${topic.member_count} members</div>
            `;
            topicEl.addEventListener('click', () => selectTopic(topic.id, topic.name));
            topicsSidebar.appendChild(topicEl);
        });
        
        // Auto-select first topic
        if (demoTopics.length > 0) {
            await selectTopic(demoTopics[0].id, demoTopics[0].name);
        }
        
        console.log(`✅ Loaded ${demoTopics.length} topics`);
    } catch (error) {
        console.error('❌ Failed to load topics:', error);
    }
}

async function selectTopic(topicId, topicName) {
    currentTopic = topicId;
    console.log(`📋 Selected topic: ${topicName}`);
    
    // Update topic selection UI
    document.querySelectorAll('.topic-item').forEach(el => {
        el.classList.remove('selected');
    });
    event?.target.closest('.topic-item')?.classList.add('selected');
    
    // Load messages for this topic
    await loadMessages(topicId);
}

async function loadMessages(topicId) {
    try {
        const messages = await dbManager.getMessagesForTopic(topicId);
        const messagesEl = document.getElementById('messages');
        
        messagesEl.innerHTML = '';
        
        if (messages.length === 0) {
            messagesEl.innerHTML = '<p style="color: #7f8c8d; font-style: italic;">No messages in this topic yet</p>';
            return;
        }
        
        messages.reverse().forEach(message => {
            const messageEl = document.createElement('div');
            messageEl.className = 'message';
            const timestamp = new Date(message.timestamp).toLocaleTimeString();
            messageEl.innerHTML = `
                <div class="message-header">
                    <strong>${message.sender_name || message.sender_peer_id}</strong>
                    <span class="timestamp">${timestamp}</span>
                </div>
                <div class="message-content">${message.content}</div>
            `;
            messagesEl.appendChild(messageEl);
        });
        
        // Scroll to bottom
        messagesEl.scrollTop = messagesEl.scrollHeight;
        
        console.log(`✅ Loaded ${messages.length} messages for topic ${topicId}`);
    } catch (error) {
        console.error('❌ Failed to load messages:', error);
    }
}

function setupMessageInput() {
    const messageInput = document.querySelector('#message-input input');
    const sendButton = document.querySelector('#message-input button');
    
    const sendMessage = async () => {
        const content = messageInput.value.trim();
        if (!content || !currentTopic) return;
        
        try {
            // Store message in database
            const message = {
                id: `msg-${Date.now()}`,
                topicId: currentTopic,
                sender: PEER_ID, // Current user's peer ID
                content: content,
                timestamp: Date.now()
            };
            
            await dbManager.storeMessage(message);
            console.log('✅ Message stored in database:', content);
            
            // Broadcast message to other P2P instances
            p2pBridge.broadcastMessage({
                id: message.id,
                topicId: message.topicId,
                sender: PEER_ID,
                senderName: PEER_NAME,
                content: message.content,
                timestamp: message.timestamp
            });
            
            // Reload messages to show the new one
            await loadMessages(currentTopic);
            
            messageInput.value = '';
        } catch (error) {
            console.error('❌ Failed to send message:', error);
        }
    };
    
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

function setupP2PBridge() {
    // Start watching for messages from other peers
    p2pBridge.startWatching();
    
    // Handle incoming messages from other instances
    p2pBridge.on('messageReceived', async (peerMessage) => {
        try {
            // Store the message in our local database
            const localMessage = {
                id: peerMessage.id,
                topicId: peerMessage.topicId,
                sender: peerMessage.sender,
                content: peerMessage.content,
                timestamp: peerMessage.timestamp
            };
            
            await dbManager.storeMessage(localMessage);
            console.log(`📥 P2P Message received from ${peerMessage.senderName}: ${peerMessage.content}`);
            
            // Update peer status to online since we received a message
            await dbManager.storePeer({
                id: peerMessage.sender,
                displayName: peerMessage.senderName,
                isOnline: true,
                reputationScore: 100 // Default score for P2P peers
            });
            
            // If we're viewing the same topic, refresh the messages
            if (currentTopic === peerMessage.topicId) {
                await loadMessages(currentTopic);
            }
            
            // Update peers list to show online status
            await loadPeers();
            
            // Update connection status to show P2P activity
            const statusEl = document.getElementById('connection-status');
            statusEl.textContent = `${PEER_NAME} - P2P Connected`;
            statusEl.style.background = '#27ae60';
            
        } catch (error) {
            console.error('❌ Failed to handle P2P message:', error);
        }
    });
    
    // Monitor P2P connection status
    setInterval(() => {
        const status = p2pBridge.getConnectionStatus();
        if (status.isConnected) {
            console.log(`🔗 P2P Connected to ${status.connectedPeers.length} peer(s): ${status.connectedPeers.join(', ')}`);
        }
    }, 10000); // Check every 10 seconds
    
    console.log('🌐 P2P Bridge initialized for real-time messaging');
}

// Cleanup on page unload
window.addEventListener('beforeunload', async () => {
    if (p2pBridge) {
        p2pBridge.stopWatching();
    }
    if (dbManager) {
        await dbManager.close();
    }
});
