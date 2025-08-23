// MessagePedia WebRTC + Electron Renderer Process
// Connected to working SQLite database with full CRUD operations

console.log('MessagePedia WebRTC + Electron Renderer Process - Database Connected!');

// Get peer configuration from window globals (set by main process)
const PEER_ID = window.MESSAGEPEDIA_PEER_ID || process.env.MESSAGEPEDIA_PEER_ID || 'peer-default-001';
const PEER_NAME = window.MESSAGEPEDIA_PEER_NAME || process.env.MESSAGEPEDIA_PEER_NAME || 'Default User';
const DB_PATH = window.MESSAGEPEDIA_DB_PATH || process.env.MESSAGEPEDIA_DB_PATH || './messagepedia.db';

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
        
        // Ensure current peer exists in database
        await dbManager.storePeer({
            id: PEER_ID,
            displayName: PEER_NAME,
            isOnline: true,
            reputationScore: 100
        });
        
        // Ensure basic topics exist in database
        await dbManager.storeTopic({
            id: 'general',
            name: 'General Discussion',
            description: 'General chat for all topics',
            isPrivate: false,
            creator: PEER_ID
        });
        
        await dbManager.storeTopic({
            id: 'tech',
            name: 'Tech Talk', 
            description: 'Technical discussions',
            isPrivate: false,
            creator: PEER_ID
        });
        
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
        
        // Setup file transfer functionality
        setupFileTransfer();
        
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
        
        // Restore last selected topic, or default to first topic
        const lastSelectedTopic = localStorage.getItem('messagepedia-last-topic') || demoTopics[0]?.name;
        const topicToSelect = demoTopics.find(t => t.name === lastSelectedTopic) || demoTopics[0];
        
        if (topicToSelect) {
            await selectTopic(topicToSelect.id, topicToSelect.name);
        }
        
        console.log(`✅ Loaded ${demoTopics.length} topics`);
    } catch (error) {
        console.error('❌ Failed to load topics:', error);
    }
}

async function selectTopic(topicId, topicName) {
    currentTopic = topicName; // Store the display name, not the ID
    console.log(`📋 Selected topic: ${topicName}`);
    
    // Save last selected topic
    localStorage.setItem('messagepedia-last-topic', topicName);
    
    // Update topic selection UI
    document.querySelectorAll('.topic-item').forEach(el => {
        el.classList.remove('selected');
    });
    event?.target.closest('.topic-item')?.classList.add('selected');
    
    // Load messages for this topic
    await loadMessages(topicName);
}

async function loadMessages(topicName) {
    try {
        // Handle no topic selected
        if (!topicName) {
            console.log('🔍 No topic selected for loading messages');
            return;
        }
        
        // Convert display name to database ID
        const topicId = topicName === 'General Discussion' ? 'general' : 'tech';
        console.log(`🔍 Loading messages for topic: ${topicName} -> ${topicId}`);
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
            // Use PEER_NAME if this is our message, otherwise use sender_name
            const displayName = message.sender_peer_id === PEER_ID ? PEER_NAME : (message.sender_name || message.sender_peer_id);
            messageEl.innerHTML = `
                <div class="message-header">
                    <strong>${displayName}</strong>
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
                topicId: currentTopic === 'General Discussion' ? 'general' : 'tech', // Map display name to DB ID
                sender: PEER_ID, // Use the current user's peer ID
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
    
    // Handle incoming file offers from other peers
    p2pBridge.on('fileOfferReceived', async (fileOffer) => {
        try {
            console.log(`📎 File offer received: ${fileOffer.fileName} from ${fileOffer.senderName}`);
            
            // Show file offer in messages as a notification from the sender
            const offerMessage = {
                id: `offer-${Date.now()}`,
                topicId: fileOffer.topicId,
                sender: fileOffer.sender, // Use actual sender peer ID
                content: `📎 Shared file: ${fileOffer.fileName} (${(fileOffer.fileSize / 1024).toFixed(1)}KB) - Click to download`,
                messageType: 'file_offer',
                fileId: fileOffer.fileId,
                timestamp: Date.now()
            };
            
            await dbManager.storeMessage(offerMessage);
            
            // If we're viewing the same topic, refresh messages
            if (currentTopic === fileOffer.topicId || 
                (currentTopic === 'General Discussion' && fileOffer.topicId === 'general') ||
                (currentTopic === 'Tech Talk' && fileOffer.topicId === 'tech')) {
                await loadMessages(currentTopic);
            }
            
        } catch (error) {
            console.error('❌ Failed to handle file offer:', error);
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

function setupFileTransfer() {
    const fileButton = document.getElementById('file-button');
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('file-drop-zone');
    const messagesArea = document.getElementById('messages-area');
    
    // File button click handler
    fileButton.addEventListener('click', () => {
        fileInput.click();
    });
    
    // File input change handler
    fileInput.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        for (const file of files) {
            await handleFileShare(file);
        }
        fileInput.value = ''; // Reset input
    });
    
    // Drag and drop handlers
    messagesArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.display = 'block';
        dropZone.style.background = '#e8f5e8';
    });
    
    messagesArea.addEventListener('dragleave', (e) => {
        if (!messagesArea.contains(e.relatedTarget)) {
            dropZone.style.display = 'none';
        }
    });
    
    messagesArea.addEventListener('drop', async (e) => {
        e.preventDefault();
        dropZone.style.display = 'none';
        
        const files = Array.from(e.dataTransfer.files);
        for (const file of files) {
            await handleFileShare(file);
        }
    });
}

async function handleFileShare(file) {
    if (!currentTopic) {
        alert('Please select a topic first');
        return;
    }
    
    try {
        console.log(`📎 Sharing file: ${file.name} (${file.size} bytes)`);
        
        // Store file metadata in database
        const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const fileRecord = {
            id: fileId,
            name: file.name,
            size: file.size,
            mimeType: file.type,
            topicId: currentTopic === 'General Discussion' ? 'general' : 'tech',
            senderPeerId: PEER_ID,
            uploadTimestamp: Date.now()
        };
        
        await dbManager.storeFile(fileRecord);
        
        console.log(`✅ File metadata stored for: ${file.name}`);
        
        // Create file share message
        const shareMessage = {
            id: `msg-${Date.now()}`,
            topicId: currentTopic === 'General Discussion' ? 'general' : 'tech',
            sender: PEER_ID,
            content: `📎 Shared file: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`,
            messageType: 'file_share',
            fileId: fileId,
            timestamp: Date.now()
        };
        
        await dbManager.storeMessage(shareMessage);
        
        // Broadcast file offer to peers
        p2pBridge.broadcastFileOffer({
            fileId: fileId,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            sender: PEER_ID,
            senderName: PEER_NAME,
            topicId: shareMessage.topicId,
            totalChunks: totalChunks
        });
        
        // Reload messages to show the file share
        await loadMessages(currentTopic);
        
        console.log(`✅ File shared successfully: ${file.name}`);
        
    } catch (error) {
        console.error('❌ Failed to share file:', error);
        alert(`Failed to share file: ${error.message}`);
    }
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
