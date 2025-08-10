const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');

/**
 * P2PNetworkManager - Manages WebRTC peer connections for MessagePedia
 * 
 * This is the core networking layer that handles:
 * - Peer discovery and connection establishment
 * - WebRTC data channel management
 * - Message routing between peers
 * - Connection health monitoring
 */
class P2PNetworkManager extends EventEmitter {
  constructor(peerId = null, signalingUrl = 'ws://localhost:8080') {
    super();
    this.peerId = peerId || uuidv4();
    this.signalingUrl = signalingUrl;
    this.peers = new Map(); // peerId -> RTCPeerConnection
    this.dataChannels = new Map(); // peerId -> { reliable, unreliable, fileTransfer }
    this.signalingSocket = null;
    this.iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ];
    this.connectionState = 'disconnected';
    this.messageQueue = new Map(); // Queue messages for peers not yet connected
  }

  /**
   * Initialize the P2P network
   */
  async initialize() {
    console.log(`🚀 Initializing P2P Network for peer: ${this.peerId}`);
    
    // Connect to signaling server
    await this.connectToSignalingServer();
    
    // Register our peer ID
    this.signalingSocket.emit('register', {
      peerId: this.peerId,
      capabilities: ['messaging', 'file-sharing', 'topics']
    });
    
    this.connectionState = 'ready';
    this.emit('ready', { peerId: this.peerId });
    
    return true;
  }

  /**
   * Connect to the signaling server for peer discovery
   */
  async connectToSignalingServer() {
    const io = require('socket.io-client');
    this.signalingSocket = io(this.signalingUrl);

    return new Promise((resolve, reject) => {
      this.signalingSocket.on('connect', () => {
        console.log('✅ Connected to signaling server');
        this.setupSignalingHandlers();
        resolve();
      });

      this.signalingSocket.on('connect_error', (error) => {
        console.error('❌ Failed to connect to signaling server:', error);
        reject(error);
      });

      setTimeout(() => {
        reject(new Error('Signaling server connection timeout'));
      }, 10000);
    });
  }

  /**
   * Setup signaling message handlers
   */
  setupSignalingHandlers() {
    // Handle peer discovery
    this.signalingSocket.on('peer-list', (peers) => {
      console.log(`📋 Discovered ${peers.length} peers`);
      peers.forEach(peer => {
        if (peer.peerId !== this.peerId && !this.peers.has(peer.peerId)) {
          this.connectToPeer(peer.peerId);
        }
      });
    });

    // Handle incoming WebRTC offers
    this.signalingSocket.on('webrtc-offer', async (data) => {
      console.log(`📨 Received offer from ${data.fromPeer}`);
      await this.handleIncomingOffer(data.fromPeer, data.offer);
    });

    // Handle WebRTC answers
    this.signalingSocket.on('webrtc-answer', async (data) => {
      console.log(`📨 Received answer from ${data.fromPeer}`);
      await this.handleIncomingAnswer(data.fromPeer, data.answer);
    });

    // Handle ICE candidates
    this.signalingSocket.on('ice-candidate', async (data) => {
      await this.handleIncomingIceCandidate(data.fromPeer, data.candidate);
    });

    // Handle peer disconnections
    this.signalingSocket.on('peer-disconnected', (peerId) => {
      console.log(`👋 Peer disconnected: ${peerId}`);
      this.removePeer(peerId);
    });
  }

  /**
   * Connect to a specific peer
   */
  async connectToPeer(remotePeerId) {
    if (this.peers.has(remotePeerId)) {
      console.log(`Already connected to ${remotePeerId}`);
      return this.peers.get(remotePeerId);
    }

    console.log(`🔗 Connecting to peer: ${remotePeerId}`);
    
    // Create RTCPeerConnection
    const peerConnection = new RTCPeerConnection({
      iceServers: this.iceServers
    });

    this.peers.set(remotePeerId, peerConnection);
    
    // Setup data channels
    this.setupDataChannels(remotePeerId, peerConnection, true);
    
    // Setup connection event handlers
    this.setupPeerConnectionHandlers(remotePeerId, peerConnection);
    
    // Create and send offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    // Send offer through signaling server
    this.signalingSocket.emit('webrtc-signal', {
      targetPeer: remotePeerId,
      type: 'offer',
      offer: offer
    });
    
    return peerConnection;
  }

  /**
   * Setup data channels for a peer connection
   */
  setupDataChannels(peerId, peerConnection, isInitiator) {
    const channels = {};
    
    if (isInitiator) {
      // Create data channels as initiator
      channels.reliable = peerConnection.createDataChannel('reliable', {
        ordered: true,
        reliable: true
      });
      
      channels.unreliable = peerConnection.createDataChannel('unreliable', {
        ordered: false,
        maxRetransmits: 0
      });
      
      channels.fileTransfer = peerConnection.createDataChannel('fileTransfer', {
        ordered: true,
        reliable: true
      });
      
      // Setup channel event handlers
      Object.entries(channels).forEach(([name, channel]) => {
        this.setupDataChannelHandlers(peerId, name, channel);
      });
      
      this.dataChannels.set(peerId, channels);
    } else {
      // Handle incoming data channels
      peerConnection.ondatachannel = (event) => {
        const channel = event.channel;
        const channelName = channel.label;
        
        if (!this.dataChannels.has(peerId)) {
          this.dataChannels.set(peerId, {});
        }
        
        const channels = this.dataChannels.get(peerId);
        channels[channelName] = channel;
        
        this.setupDataChannelHandlers(peerId, channelName, channel);
      };
    }
  }

  /**
   * Setup data channel event handlers
   */
  setupDataChannelHandlers(peerId, channelName, channel) {
    channel.onopen = () => {
      console.log(`✅ Data channel '${channelName}' opened with ${peerId}`);
      this.emit('channel-open', { peerId, channelName });
      
      // Send any queued messages
      if (this.messageQueue.has(peerId)) {
        const queue = this.messageQueue.get(peerId);
        queue.forEach(msg => this.sendMessage(peerId, msg.type, msg.data));
        this.messageQueue.delete(peerId);
      }
    };
    
    channel.onmessage = (event) => {
      this.handleDataChannelMessage(peerId, channelName, event.data);
    };
    
    channel.onerror = (error) => {
      console.error(`❌ Data channel error on ${channelName}:`, error);
      this.emit('channel-error', { peerId, channelName, error });
    };
    
    channel.onclose = () => {
      console.log(`🔚 Data channel '${channelName}' closed with ${peerId}`);
      this.emit('channel-close', { peerId, channelName });
    };
  }

  /**
   * Setup peer connection event handlers
   */
  setupPeerConnectionHandlers(peerId, peerConnection) {
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.signalingSocket.emit('webrtc-signal', {
          targetPeer: peerId,
          type: 'ice-candidate',
          candidate: event.candidate
        });
      }
    };
    
    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;
      console.log(`📡 Connection state with ${peerId}: ${state}`);
      this.emit('connection-state-change', { peerId, state });
      
      if (state === 'failed' || state === 'disconnected') {
        this.handlePeerDisconnection(peerId);
      }
    };
    
    peerConnection.oniceconnectionstatechange = () => {
      const state = peerConnection.iceConnectionState;
      console.log(`🧊 ICE state with ${peerId}: ${state}`);
      
      if (state === 'connected' || state === 'completed') {
        this.emit('peer-connected', { peerId });
      }
    };
  }

  /**
   * Handle incoming WebRTC offer
   */
  async handleIncomingOffer(fromPeer, offer) {
    console.log(`🤝 Handling offer from ${fromPeer}`);
    
    const peerConnection = new RTCPeerConnection({
      iceServers: this.iceServers
    });
    
    this.peers.set(fromPeer, peerConnection);
    
    // Setup as non-initiator
    this.setupDataChannels(fromPeer, peerConnection, false);
    this.setupPeerConnectionHandlers(fromPeer, peerConnection);
    
    // Set remote description and create answer
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    // Send answer back
    this.signalingSocket.emit('webrtc-signal', {
      targetPeer: fromPeer,
      type: 'answer',
      answer: answer
    });
  }

  /**
   * Handle incoming WebRTC answer
   */
  async handleIncomingAnswer(fromPeer, answer) {
    const peerConnection = this.peers.get(fromPeer);
    if (!peerConnection) {
      console.error(`No connection found for peer ${fromPeer}`);
      return;
    }
    
    await peerConnection.setRemoteDescription(answer);
  }

  /**
   * Handle incoming ICE candidate
   */
  async handleIncomingIceCandidate(fromPeer, candidate) {
    const peerConnection = this.peers.get(fromPeer);
    if (!peerConnection) {
      console.error(`No connection found for peer ${fromPeer}`);
      return;
    }
    
    try {
      await peerConnection.addIceCandidate(candidate);
    } catch (error) {
      console.error(`Failed to add ICE candidate from ${fromPeer}:`, error);
    }
  }

  /**
   * Handle messages from data channels
   */
  handleDataChannelMessage(peerId, channelName, data) {
    try {
      const message = JSON.parse(data);
      console.log(`📨 Message from ${peerId} on ${channelName}:`, message.type);
      
      this.emit('message', {
        peerId,
        channel: channelName,
        message
      });
    } catch (error) {
      // Handle binary data (file transfers)
      this.emit('binary-data', {
        peerId,
        channel: channelName,
        data
      });
    }
  }

  /**
   * Send a message to a peer
   */
  sendMessage(targetPeerId, type, data) {
    const channels = this.dataChannels.get(targetPeerId);
    
    if (!channels || !channels.reliable || channels.reliable.readyState !== 'open') {
      // Queue message if peer not connected
      if (!this.messageQueue.has(targetPeerId)) {
        this.messageQueue.set(targetPeerId, []);
      }
      this.messageQueue.get(targetPeerId).push({ type, data });
      console.log(`📦 Queued message for ${targetPeerId}`);
      return false;
    }
    
    const message = JSON.stringify({
      type,
      data,
      timestamp: Date.now(),
      from: this.peerId
    });
    
    channels.reliable.send(message);
    return true;
  }

  /**
   * Broadcast a message to all connected peers
   */
  broadcastMessage(type, data) {
    let sent = 0;
    this.dataChannels.forEach((channels, peerId) => {
      if (this.sendMessage(peerId, type, data)) {
        sent++;
      }
    });
    console.log(`📢 Broadcast message to ${sent} peers`);
    return sent;
  }

  /**
   * Send binary data (for file transfers)
   */
  sendBinaryData(targetPeerId, data) {
    const channels = this.dataChannels.get(targetPeerId);
    
    if (!channels || !channels.fileTransfer || channels.fileTransfer.readyState !== 'open') {
      console.error(`Cannot send binary data to ${targetPeerId}: channel not ready`);
      return false;
    }
    
    channels.fileTransfer.send(data);
    return true;
  }

  /**
   * Handle peer disconnection
   */
  handlePeerDisconnection(peerId) {
    console.log(`🔌 Handling disconnection of ${peerId}`);
    this.removePeer(peerId);
    
    // Attempt reconnection after delay
    setTimeout(() => {
      console.log(`🔄 Attempting to reconnect to ${peerId}`);
      this.connectToPeer(peerId);
    }, 5000);
  }

  /**
   * Remove a peer connection
   */
  removePeer(peerId) {
    const peerConnection = this.peers.get(peerId);
    if (peerConnection) {
      peerConnection.close();
      this.peers.delete(peerId);
    }
    
    const channels = this.dataChannels.get(peerId);
    if (channels) {
      Object.values(channels).forEach(channel => {
        if (channel && channel.readyState === 'open') {
          channel.close();
        }
      });
      this.dataChannels.delete(peerId);
    }
    
    this.emit('peer-removed', { peerId });
  }

  /**
   * Get list of connected peers
   */
  getConnectedPeers() {
    const connectedPeers = [];
    this.peers.forEach((connection, peerId) => {
      if (connection.connectionState === 'connected') {
        connectedPeers.push(peerId);
      }
    });
    return connectedPeers;
  }

  /**
   * Get connection statistics
   */
  async getConnectionStats(peerId) {
    const peerConnection = this.peers.get(peerId);
    if (!peerConnection) {
      return null;
    }
    
    const stats = await peerConnection.getStats();
    const report = {};
    
    stats.forEach(stat => {
      if (stat.type === 'data-channel') {
        report.dataChannel = {
          bytesReceived: stat.bytesReceived,
          bytesSent: stat.bytesSent,
          messagesReceived: stat.messagesReceived,
          messagesSent: stat.messagesSent,
          state: stat.state
        };
      }
    });
    
    return report;
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown() {
    console.log('🔚 Shutting down P2P Network Manager');
    
    // Close all peer connections
    this.peers.forEach((connection, peerId) => {
      this.removePeer(peerId);
    });
    
    // Disconnect from signaling server
    if (this.signalingSocket) {
      this.signalingSocket.disconnect();
    }
    
    this.connectionState = 'disconnected';
    this.emit('shutdown');
  }
}

module.exports = P2PNetworkManager;
