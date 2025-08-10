const P2PNetworkManager = require('../../../src/services/p2p/P2PNetworkManager');

// Mock WebRTC APIs
global.RTCPeerConnection = jest.fn(() => ({
  createOffer: jest.fn(() => Promise.resolve({ type: 'offer', sdp: 'mock-sdp' })),
  createAnswer: jest.fn(() => Promise.resolve({ type: 'answer', sdp: 'mock-sdp' })),
  setLocalDescription: jest.fn(() => Promise.resolve()),
  setRemoteDescription: jest.fn(() => Promise.resolve()),
  addIceCandidate: jest.fn(() => Promise.resolve()),
  createDataChannel: jest.fn(() => ({
    onopen: null,
    onmessage: null,
    onerror: null,
    onclose: null,
    send: jest.fn(),
    close: jest.fn(),
    readyState: 'open'
  })),
  close: jest.fn(),
  connectionState: 'connected',
  iceConnectionState: 'connected',
  getStats: jest.fn(() => Promise.resolve(new Map()))
}));

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  const mockSocket = {
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn()
  };
  return jest.fn(() => mockSocket);
});

describe('P2PNetworkManager', () => {
  let manager;

  beforeEach(() => {
    manager = new P2PNetworkManager('test-peer-123');
  });

  afterEach(() => {
    if (manager) {
      manager.shutdown();
    }
  });

  describe('Initialization', () => {
    test('should create manager with peer ID', () => {
      expect(manager.peerId).toBe('test-peer-123');
      expect(manager.peers).toBeInstanceOf(Map);
      expect(manager.dataChannels).toBeInstanceOf(Map);
    });

    test('should generate peer ID if not provided', () => {
      const autoManager = new P2PNetworkManager();
      expect(autoManager.peerId).toBeTruthy();
      expect(typeof autoManager.peerId).toBe('string');
    });

    test('should have correct initial state', () => {
      expect(manager.connectionState).toBe('disconnected');
      expect(manager.peers.size).toBe(0);
      expect(manager.dataChannels.size).toBe(0);
    });
  });

  describe('Peer Connection', () => {
    test('should create peer connection with correct configuration', async () => {
      const remotePeerId = 'remote-peer-456';
      await manager.connectToPeer(remotePeerId);
      
      expect(manager.peers.has(remotePeerId)).toBe(true);
      expect(RTCPeerConnection).toHaveBeenCalledWith({
        iceServers: expect.arrayContaining([
          expect.objectContaining({ urls: expect.stringContaining('stun:') })
        ])
      });
    });

    test('should not create duplicate connections', async () => {
      const remotePeerId = 'remote-peer-456';
      const conn1 = await manager.connectToPeer(remotePeerId);
      const conn2 = await manager.connectToPeer(remotePeerId);
      
      expect(conn1).toBe(conn2);
      expect(manager.peers.size).toBe(1);
    });

    test('should setup data channels correctly', async () => {
      const remotePeerId = 'remote-peer-456';
      const connection = await manager.connectToPeer(remotePeerId);
      
      expect(connection.createDataChannel).toHaveBeenCalledWith('reliable', expect.any(Object));
      expect(connection.createDataChannel).toHaveBeenCalledWith('unreliable', expect.any(Object));
      expect(connection.createDataChannel).toHaveBeenCalledWith('fileTransfer', expect.any(Object));
    });
  });

  describe('Message Handling', () => {
    test('should send message to connected peer', () => {
      const targetPeer = 'peer-123';
      const mockChannel = {
        send: jest.fn(),
        readyState: 'open'
      };
      
      manager.dataChannels.set(targetPeer, {
        reliable: mockChannel
      });
      
      const result = manager.sendMessage(targetPeer, 'test-message', { content: 'Hello' });
      
      expect(result).toBe(true);
      expect(mockChannel.send).toHaveBeenCalled();
      const sentData = JSON.parse(mockChannel.send.mock.calls[0][0]);
      expect(sentData.type).toBe('test-message');
      expect(sentData.data).toEqual({ content: 'Hello' });
    });

    test('should queue messages for disconnected peers', () => {
      const targetPeer = 'disconnected-peer';
      const result = manager.sendMessage(targetPeer, 'test-message', { content: 'Hello' });
      
      expect(result).toBe(false);
      expect(manager.messageQueue.has(targetPeer)).toBe(true);
      expect(manager.messageQueue.get(targetPeer)).toHaveLength(1);
    });

    test('should broadcast message to all connected peers', () => {
      // Setup multiple connected peers
      const peers = ['peer-1', 'peer-2', 'peer-3'];
      peers.forEach(peerId => {
        manager.dataChannels.set(peerId, {
          reliable: {
            send: jest.fn(),
            readyState: 'open'
          }
        });
      });
      
      const sent = manager.broadcastMessage('broadcast-test', { data: 'test' });
      
      expect(sent).toBe(3);
      peers.forEach(peerId => {
        const channel = manager.dataChannels.get(peerId).reliable;
        expect(channel.send).toHaveBeenCalled();
      });
    });
  });

  describe('Binary Data Transfer', () => {
    test('should send binary data through file transfer channel', () => {
      const targetPeer = 'peer-123';
      const mockChannel = {
        send: jest.fn(),
        readyState: 'open'
      };
      
      manager.dataChannels.set(targetPeer, {
        fileTransfer: mockChannel
      });
      
      const binaryData = new ArrayBuffer(1024);
      const result = manager.sendBinaryData(targetPeer, binaryData);
      
      expect(result).toBe(true);
      expect(mockChannel.send).toHaveBeenCalledWith(binaryData);
    });

    test('should reject binary transfer if channel not ready', () => {
      const targetPeer = 'peer-123';
      const binaryData = new ArrayBuffer(1024);
      const result = manager.sendBinaryData(targetPeer, binaryData);
      
      expect(result).toBe(false);
    });
  });

  describe('Peer Management', () => {
    test('should remove peer and cleanup connections', () => {
      const peerId = 'peer-to-remove';
      const mockConnection = {
        close: jest.fn(),
        connectionState: 'connected'
      };
      const mockChannel = {
        close: jest.fn(),
        readyState: 'open'
      };
      
      manager.peers.set(peerId, mockConnection);
      manager.dataChannels.set(peerId, {
        reliable: mockChannel
      });
      
      manager.removePeer(peerId);
      
      expect(mockConnection.close).toHaveBeenCalled();
      expect(mockChannel.close).toHaveBeenCalled();
      expect(manager.peers.has(peerId)).toBe(false);
      expect(manager.dataChannels.has(peerId)).toBe(false);
    });

    test('should get list of connected peers', () => {
      manager.peers.set('peer-1', { connectionState: 'connected' });
      manager.peers.set('peer-2', { connectionState: 'connecting' });
      manager.peers.set('peer-3', { connectionState: 'connected' });
      
      const connected = manager.getConnectedPeers();
      
      expect(connected).toEqual(['peer-1', 'peer-3']);
    });
  });

  describe('Event Emission', () => {
    test('should emit peer-connected event', (done) => {
      manager.on('peer-connected', (data) => {
        expect(data.peerId).toBe('test-peer');
        done();
      });
      
      manager.emit('peer-connected', { peerId: 'test-peer' });
    });

    test('should emit message event', (done) => {
      manager.on('message', (data) => {
        expect(data.peerId).toBe('sender-peer');
        expect(data.message.type).toBe('test');
        done();
      });
      
      manager.handleDataChannelMessage('sender-peer', 'reliable', JSON.stringify({
        type: 'test',
        data: 'hello'
      }));
    });
  });

  describe('Shutdown', () => {
    test('should cleanup all connections on shutdown', async () => {
      const peers = ['peer-1', 'peer-2'];
      peers.forEach(peerId => {
        manager.peers.set(peerId, {
          close: jest.fn(),
          connectionState: 'connected'
        });
      });
      
      await manager.shutdown();
      
      expect(manager.peers.size).toBe(0);
      expect(manager.connectionState).toBe('disconnected');
    });
  });
});
