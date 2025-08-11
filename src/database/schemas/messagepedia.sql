-- MessagePedia SQLite Database Schema
-- Created with proper execution order: Tables first, then indexes

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- =================
-- TABLE DEFINITIONS
-- =================

-- Peers table - stores information about P2P peers
CREATE TABLE IF NOT EXISTS peers (
    id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    public_key TEXT,
    last_seen INTEGER NOT NULL,
    is_online BOOLEAN DEFAULT 0,
    connection_count INTEGER DEFAULT 0,
    reputation_score INTEGER DEFAULT 100,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Topics table - stores P2P topic/channel information  
CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    creator_peer_id TEXT NOT NULL,
    is_private BOOLEAN DEFAULT 0,
    member_count INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    last_activity INTEGER,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (creator_peer_id) REFERENCES peers(id) ON DELETE CASCADE
);

-- Topic members - many-to-many relationship between peers and topics
CREATE TABLE IF NOT EXISTS topic_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id TEXT NOT NULL,
    peer_id TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    joined_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    last_read_message_id TEXT,
    UNIQUE(topic_id, peer_id),
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    FOREIGN KEY (peer_id) REFERENCES peers(id) ON DELETE CASCADE
);

-- Messages table - stores all P2P messages
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    topic_id TEXT NOT NULL,
    sender_peer_id TEXT NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    reply_to_message_id TEXT,
    attachments TEXT,
    is_edited BOOLEAN DEFAULT 0,
    edit_history TEXT,
    timestamp INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_peer_id) REFERENCES peers(id) ON DELETE CASCADE,
    FOREIGN KEY (reply_to_message_id) REFERENCES messages(id) ON DELETE SET NULL
);

-- Files table - stores file sharing information
CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    size INTEGER NOT NULL,
    mime_type TEXT,
    sha256_hash TEXT UNIQUE,
    chunk_count INTEGER NOT NULL,
    chunk_size INTEGER NOT NULL,
    shared_by_peer_id TEXT NOT NULL,
    topic_id TEXT,
    upload_complete BOOLEAN DEFAULT 0,
    download_complete BOOLEAN DEFAULT 0,
    local_path TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (shared_by_peer_id) REFERENCES peers(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL
);

-- File chunks - stores individual file chunk information
CREATE TABLE IF NOT EXISTS file_chunks (
    id TEXT PRIMARY KEY,
    file_id TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    chunk_hash TEXT NOT NULL,
    chunk_size INTEGER NOT NULL,
    available_peers TEXT,
    is_downloaded BOOLEAN DEFAULT 0,
    local_path TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    UNIQUE(file_id, chunk_index),
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
);

-- Settings table - application configuration
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    type TEXT DEFAULT 'string',
    description TEXT,
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Connection history - track P2P connections
CREATE TABLE IF NOT EXISTS connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    peer_id TEXT NOT NULL,
    connection_type TEXT NOT NULL,
    status TEXT NOT NULL,
    duration INTEGER,
    bytes_sent INTEGER DEFAULT 0,
    bytes_received INTEGER DEFAULT 0,
    started_at INTEGER NOT NULL,
    ended_at INTEGER,
    FOREIGN KEY (peer_id) REFERENCES peers(id) ON DELETE CASCADE
);

-- ===================
-- PERFORMANCE INDEXES  
-- ===================

-- Peers indexes
CREATE INDEX IF NOT EXISTS idx_peers_last_seen ON peers(last_seen);
CREATE INDEX IF NOT EXISTS idx_peers_online ON peers(is_online);

-- Topics indexes
CREATE INDEX IF NOT EXISTS idx_topics_creator ON topics(creator_peer_id);
CREATE INDEX IF NOT EXISTS idx_topics_activity ON topics(last_activity);

-- Topic members indexes
CREATE INDEX IF NOT EXISTS idx_topic_members_topic ON topic_members(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_members_peer ON topic_members(peer_id);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_topic ON messages(topic_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_peer_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_reply ON messages(reply_to_message_id);

-- Files indexes
CREATE INDEX IF NOT EXISTS idx_files_shared_by ON files(shared_by_peer_id);
CREATE INDEX IF NOT EXISTS idx_files_topic ON files(topic_id);

-- File chunks indexes
CREATE INDEX IF NOT EXISTS idx_file_chunks_file ON file_chunks(file_id);

-- Connections indexes  
CREATE INDEX IF NOT EXISTS idx_connections_peer ON connections(peer_id);
CREATE INDEX IF NOT EXISTS idx_connections_started ON connections(started_at);

-- ==============
-- DEFAULT DATA
-- ==============

-- Insert default settings
INSERT OR REPLACE INTO settings (key, value, type, description) VALUES
('peer_id', '', 'string', 'This peer unique identifier'),
('display_name', 'Anonymous User', 'string', 'Display name for this peer'),
('auto_connect', '1', 'boolean', 'Automatically connect to known peers on startup'),
('max_connections', '50', 'number', 'Maximum number of simultaneous peer connections'),
('file_download_dir', './downloads', 'string', 'Directory for downloaded files'),
('signaling_server_url', 'ws://localhost:8080', 'string', 'WebRTC signaling server URL'),
('enable_file_sharing', '1', 'boolean', 'Allow file sharing with peers'),
('max_file_size', '1073741824', 'number', 'Maximum file size for sharing (1GB)'),
('chunk_size', '65536', 'number', 'File chunk size in bytes (64KB)');
