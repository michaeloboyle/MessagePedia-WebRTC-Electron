const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

/**
 * SimpleP2PBridge - A file-based P2P message sync for demo purposes
 * 
 * This creates a simple P2P-like experience by using shared files to sync messages
 * between multiple MessagePedia instances running on the same machine.
 * 
 * In a real implementation, this would be replaced with WebRTC connections.
 */
class SimpleP2PBridge extends EventEmitter {
    constructor(peerId, sharedDir = './shared-p2p') {
        super();
        this.peerId = peerId;
        this.sharedDir = sharedDir;
        this.messageBridgeFile = path.join(sharedDir, 'message-bridge.json');
        this.lastProcessedIndex = 0;
        this.isWatching = false;
        
        // Ensure shared directory exists
        if (!fs.existsSync(sharedDir)) {
            fs.mkdirSync(sharedDir, { recursive: true });
        }
        
        // Initialize message bridge file if it doesn't exist
        if (!fs.existsSync(this.messageBridgeFile)) {
            fs.writeFileSync(this.messageBridgeFile, JSON.stringify([]));
        }
    }
    
    /**
     * Start watching for P2P messages from other instances
     */
    startWatching() {
        if (this.isWatching) return;
        
        this.isWatching = true;
        console.log(`🔄 P2P Bridge watching for peer messages (${this.peerId})`);
        
        // Read current messages to get starting index
        this.lastProcessedIndex = this.getMessagesFromBridge().length;
        
        // Watch for file changes
        this.watcher = fs.watchFile(this.messageBridgeFile, { interval: 500 }, () => {
            this.checkForNewMessages();
        });
    }
    
    /**
     * Stop watching for P2P messages
     */
    stopWatching() {
        if (!this.isWatching) return;
        
        this.isWatching = false;
        if (this.watcher) {
            fs.unwatchFile(this.messageBridgeFile);
        }
        console.log(`🛑 P2P Bridge stopped watching (${this.peerId})`);
    }
    
    /**
     * Broadcast a message to all other peers
     */
    broadcastMessage(message) {
        try {
            const bridgeMessage = {
                ...message,
                fromPeer: this.peerId,
                timestamp: Date.now(),
                bridgeId: `bridge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            };
            
            const messages = this.getMessagesFromBridge();
            messages.push(bridgeMessage);
            
            fs.writeFileSync(this.messageBridgeFile, JSON.stringify(messages, null, 2));
            console.log(`📡 P2P Broadcast: ${message.content} (from ${this.peerId})`);
            
        } catch (error) {
            console.error('❌ Failed to broadcast message:', error);
        }
    }
    
    /**
     * Check for new messages from other peers
     */
    checkForNewMessages() {
        try {
            const messages = this.getMessagesFromBridge();
            
            // Process new messages since last check
            const newMessages = messages.slice(this.lastProcessedIndex);
            
            newMessages.forEach(message => {
                // Don't process our own messages
                if (message.fromPeer !== this.peerId) {
                    if (message.type === 'file_offer') {
                        console.log(`📎 P2P File Offer Received: ${message.fileOffer.fileName} (from ${message.fromPeer})`);
                        this.emit('fileOfferReceived', message.fileOffer);
                    } else {
                        console.log(`📥 P2P Received: ${message.content} (from ${message.fromPeer})`);
                        this.emit('messageReceived', message);
                    }
                }
            });
            
            this.lastProcessedIndex = messages.length;
            
        } catch (error) {
            console.error('❌ Failed to check for new messages:', error);
        }
    }
    
    /**
     * Get all messages from the bridge file
     */
    getMessagesFromBridge() {
        try {
            const content = fs.readFileSync(this.messageBridgeFile, 'utf8');
            return JSON.parse(content) || [];
        } catch (error) {
            console.error('❌ Failed to read bridge messages:', error);
            return [];
        }
    }
    
    /**
     * Broadcast file offer to other peers
     */
    broadcastFileOffer(fileOffer) {
        try {
            const messages = this.getMessagesFromBridge();
            const fileOfferMessage = {
                type: 'file_offer',
                fromPeer: this.peerId,
                fileOffer: fileOffer,
                timestamp: Date.now()
            };
            
            messages.push(fileOfferMessage);
            
            fs.writeFileSync(this.messageBridgeFile, JSON.stringify(messages, null, 2));
            console.log(`📎 P2P File Offer: ${fileOffer.fileName} (from ${this.peerId})`);
            
        } catch (error) {
            console.error('❌ Failed to broadcast file offer:', error);
        }
    }
    
    /**
     * Clear the message bridge (for testing)
     */
    clearBridge() {
        try {
            fs.writeFileSync(this.messageBridgeFile, JSON.stringify([]));
            this.lastProcessedIndex = 0;
            console.log('🗑️ P2P Bridge cleared');
        } catch (error) {
            console.error('❌ Failed to clear bridge:', error);
        }
    }
    
    /**
     * Get peer connection status
     */
    getConnectionStatus() {
        const messages = this.getMessagesFromBridge();
        const recentMessages = messages.filter(msg => 
            Date.now() - msg.timestamp < 30000 && // Last 30 seconds
            msg.fromPeer !== this.peerId
        );
        
        const connectedPeers = [...new Set(recentMessages.map(msg => msg.fromPeer))];
        
        return {
            isConnected: connectedPeers.length > 0,
            connectedPeers: connectedPeers,
            totalMessages: messages.length
        };
    }
}

module.exports = SimpleP2PBridge;