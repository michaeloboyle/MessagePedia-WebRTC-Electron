// Core MessagePedia Types
export type PeerId = string;
export type TopicId = string;
export type MessageId = string;
export type FileId = string;
export type ChunkId = string;

export interface Message {
  id: MessageId;
  topicId: TopicId;
  sender: PeerId;
  text: string;
  timestamp: number;
  signature: string;
  attachments: FileReference[];
  replyTo?: MessageId;
  editSequence: number;
}

export interface Topic {
  id: TopicId;
  name: string;
  creator: PeerId;
  created: number;
  isPrivate: boolean;
  members: Set<PeerId>;
  messages: Message[];
  lastActivity?: number;
}

export interface FileReference {
  fileId: FileId;
  name: string;
  size: number;
  mimeType: string;
  chunkCount: number;
}

export interface FileManifest extends FileReference {
  chunks: ChunkInfo[];
  sharer: PeerId;
  topicId: TopicId;
}

export interface ChunkInfo {
  id: ChunkId;
  index: number;
  size: number;
  hash: string;
}

export interface PeerInfo {
  id: PeerId;
  publicKey: string;
  displayName?: string;
  lastSeen: number;
  reputation: number;
  capabilities: string[];
}

export interface TransferState {
  fileId: FileId;
  manifest: FileManifest;
  downloadedChunks: Set<ChunkId>;
  inProgressChunks: Map<ChunkId, PeerId>;
  availablePeers: Set<PeerId>;
  transferSpeed: number;
  estimatedCompletion?: number;
}

// WebRTC Protocol Messages
export interface P2PMessage {
  type: string;
  timestamp: number;
  data: any;
}

export interface MessageProtocol {
  'message': { topicId: TopicId; message: Message };
  'topic-announce': { topic: Topic };
  'topic-request': { topicId: TopicId };
  'sync-request': { topicId: TopicId; lastTimestamp: number };
  'file-available': { manifest: FileManifest };
  'chunk-request': { fileId: FileId; chunkId: ChunkId };
  'chunk-data': { chunkId: ChunkId; data: ArrayBuffer };
}

export interface PresenceProtocol {
  'typing-indicator': { topicId: TopicId; isTyping: boolean };
  'peer-status': { status: 'online' | 'away' | 'busy' };
  'heartbeat': { timestamp: number };
}

// Configuration
export interface AppConfig {
  signaling: {
    servers: string[];
    reconnectInterval: number;
  };
  webrtc: {
    iceServers: RTCIceServer[];
    connectionTimeout: number;
  };
  storage: {
    databasePath: string;
    chunksPath: string;
    maxChunkSize: number;
  };
}
