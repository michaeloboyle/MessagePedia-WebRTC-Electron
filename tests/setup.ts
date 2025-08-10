// Jest test setup
import 'jest';

// Mock Electron in tests
const mockElectron = {
  app: {
    on: jest.fn(),
    whenReady: jest.fn(() => Promise.resolve()),
    quit: jest.fn(),
  },
  BrowserWindow: jest.fn(),
  ipcMain: {
    on: jest.fn(),
    handle: jest.fn(),
  },
  ipcRenderer: {
    invoke: jest.fn(),
    send: jest.fn(),
    on: jest.fn(),
  },
};

// Mock WebRTC APIs
global.RTCPeerConnection = jest.fn(() => ({
  createOffer: jest.fn(() => Promise.resolve({})),
  createAnswer: jest.fn(() => Promise.resolve({})),
  setLocalDescription: jest.fn(() => Promise.resolve()),
  setRemoteDescription: jest.fn(() => Promise.resolve()),
  addIceCandidate: jest.fn(() => Promise.resolve()),
  createDataChannel: jest.fn(),
  addEventListener: jest.fn(),
  close: jest.fn(),
}));

global.RTCSessionDescription = jest.fn();
global.RTCIceCandidate = jest.fn();

if (typeof window === 'undefined') {
  // Node.js environment
  jest.mock('electron', () => mockElectron);
}

// Test utilities
export const createMockPeer = (id: string) => ({
  id,
  publicKey: 'mock-public-key',
  displayName: `Test Peer ${id}`,
  lastSeen: Date.now(),
  reputation: 0,
  capabilities: ['messaging', 'file-sharing'],
});

export const createMockTopic = (id: string, name: string) => ({
  id,
  name,
  creator: 'test-peer-1',
  created: Date.now(),
  isPrivate: false,
  members: new Set(['test-peer-1']),
  messages: [],
});

export const createMockMessage = (topicId: string, sender: string, text: string) => ({
  id: `msg-${Date.now()}`,
  topicId,
  sender,
  text,
  timestamp: Date.now(),
  signature: 'mock-signature',
  attachments: [],
  editSequence: 0,
});
