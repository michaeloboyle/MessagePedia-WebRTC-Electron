const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

/**
 * DatabaseManager - Handles all SQLite database operations for MessagePedia
 * Updated to use sqlite3 package with proper sequential schema execution
 */
class DatabaseManager {
    constructor(dbPath = './messagepedia.db') {
        this.dbPath = dbPath;
        this.db = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the database connection and create schema
     */
    async initialize() {
        return new Promise((resolve, reject) => {
            try {
                // Ensure database directory exists
                const dbDir = path.dirname(this.dbPath);
                if (!fs.existsSync(dbDir)) {
                    fs.mkdirSync(dbDir, { recursive: true });
                }

                // Open database connection
                this.db = new sqlite3.Database(this.dbPath, (err) => {
                    if (err) {
                        console.error('❌ Database connection failed:', err);
                        reject(err);
                        return;
                    }

                    console.log('✅ Connected to SQLite database');
                    
                    // Enable foreign keys and WAL mode
                    this.db.run('PRAGMA foreign_keys = ON');
                    this.db.run('PRAGMA journal_mode = WAL');
                    
                    // Load and execute schema SEQUENTIALLY
                    this.createSchemaSequentially()
                        .then(() => {
                            this.isInitialized = true;
                            console.log('✅ Database initialized successfully');
                            resolve(true);
                        })
                        .catch(reject);
                });
            } catch (error) {
                console.error('❌ Database initialization failed:', error);
                reject(error);
            }
        });
    }

    /**
     * Create database schema with sequential execution
     */
    async createSchemaSequentially() {
        return new Promise(async (resolve, reject) => {
            const schemaPath = path.join(__dirname, 'schemas', 'messagepedia.sql');
            
            if (!fs.existsSync(schemaPath)) {
                reject(new Error(`Schema file not found: ${schemaPath}`));
                return;
            }

            const schema = fs.readFileSync(schemaPath, 'utf8');
            
            // Split into individual statements and clean them up
            const statements = schema.split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => {
                    if (stmt.length === 0) return false;
                    if (stmt.startsWith('PRAGMA')) return false;
                    // Keep statements that start with -- only if they contain CREATE/INSERT
                    if (stmt.startsWith('--')) {
                        return stmt.includes('CREATE') || stmt.includes('INSERT');
                    }
                    return true;
                });
            
            if (statements.length === 0) {
                resolve();
                return;
            }

            console.log(`📋 Executing ${statements.length} schema statements sequentially...`);
            
            // Debug: Log first few statements to verify parsing
            console.log('🔍 First 3 statements being executed:');
            statements.slice(0, 3).forEach((stmt, i) => {
                console.log(`  ${i + 1}: ${stmt.substring(0, 80)}...`);
            });
            
            try {
                // Execute statements one by one using serialize
                this.db.serialize(() => {
                    statements.forEach((statement, index) => {
                        this.db.run(statement, (err) => {
                            if (err) {
                                console.error(`❌ Schema statement ${index + 1} failed:`, err);
                                console.error(`Statement: ${statement.substring(0, 100)}...`);
                                reject(err);
                                return;
                            }
                            
                            // Log successful execution of major statements
                            if (statement.includes('CREATE TABLE')) {
                                const tableName = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/)[1];
                                console.log(`✅ Created table: ${tableName}`);
                            }
                        });
                    });
                    
                    // All statements queued, resolve after completion
                    this.db.run('SELECT 1', (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            console.log('✅ All schema statements executed successfully');
                            resolve();
                        }
                    });
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Peer operations
     */
    async storePeer(peer) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT OR REPLACE INTO peers (id, display_name, public_key, last_seen, is_online, reputation_score)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            this.db.run(sql, [
                peer.id,
                peer.displayName || 'Unknown',
                peer.publicKey || null,
                peer.lastSeen || Date.now(),
                peer.isOnline ? 1 : 0,
                peer.reputationScore || 100
            ], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    }

    async getPeer(peerId) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM peers WHERE id = ?', [peerId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    async getAllPeers() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM peers ORDER BY last_seen DESC', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    async getOnlinePeers() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM peers WHERE is_online = 1 ORDER BY last_seen DESC', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    /**
     * Topic operations
     */
    async storeTopic(topic) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT OR REPLACE INTO topics (id, name, description, creator_peer_id, is_private, last_activity)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            this.db.run(sql, [
                topic.id,
                topic.name,
                topic.description || null,
                topic.creator,
                topic.isPrivate ? 1 : 0,
                topic.lastActivity || Date.now()
            ], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    }

    async getTopic(topicId) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM topics WHERE id = ?', [topicId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    async getTopicsForPeer(peerId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT t.* FROM topics t 
                JOIN topic_members tm ON t.id = tm.topic_id 
                WHERE tm.peer_id = ? 
                ORDER BY t.last_activity DESC
            `;
            this.db.all(sql, [peerId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    async addTopicMember(topicId, peerId, role = 'member') {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT OR REPLACE INTO topic_members (topic_id, peer_id, role)
                VALUES (?, ?, ?)
            `;
            this.db.run(sql, [topicId, peerId, role], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    }

    /**
     * Message operations
     */
    async storeMessage(message) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT OR REPLACE INTO messages (id, topic_id, sender_peer_id, content, message_type, reply_to_message_id, attachments, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            this.db.run(sql, [
                message.id,
                message.topicId,
                message.sender,
                message.content,
                message.type || 'text',
                message.replyTo || null,
                message.attachments ? JSON.stringify(message.attachments) : null,
                message.timestamp
            ], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    }

    async getMessagesForTopic(topicId, limit = 100, offset = 0) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT m.*, p.display_name as sender_name 
                FROM messages m
                LEFT JOIN peers p ON m.sender_peer_id = p.id
                WHERE m.topic_id = ?
                ORDER BY m.timestamp DESC
                LIMIT ? OFFSET ?
            `;
            this.db.all(sql, [topicId, limit, offset], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    async searchMessages(query, topicId = null) {
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT m.*, p.display_name as sender_name, t.name as topic_name
                FROM messages m
                LEFT JOIN peers p ON m.sender_peer_id = p.id
                LEFT JOIN topics t ON m.topic_id = t.id
                WHERE m.content LIKE ?
            `;
            
            const params = [`%${query}%`];
            
            if (topicId) {
                sql += ' AND m.topic_id = ?';
                params.push(topicId);
            }
            
            sql += ' ORDER BY m.timestamp DESC LIMIT 50';
            
            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    /**
     * Settings operations
     */
    async setSetting(key, value, type = 'string') {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT OR REPLACE INTO settings (key, value, type, updated_at)
                VALUES (?, ?, ?, strftime('%s', 'now'))
            `;
            this.db.run(sql, [key, value.toString(), type], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    }

    async getSetting(key, defaultValue = null) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT value, type FROM settings WHERE key = ?', [key], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                if (!row) {
                    resolve(defaultValue);
                    return;
                }
                
                // Convert based on type
                let convertedValue;
                switch (row.type) {
                    case 'boolean':
                        convertedValue = row.value === '1' || row.value === 'true';
                        break;
                    case 'number':
                        convertedValue = Number(row.value);
                        break;
                    case 'json':
                        try {
                            convertedValue = JSON.parse(row.value);
                        } catch (e) {
                            convertedValue = row.value;
                        }
                        break;
                    default:
                        convertedValue = row.value;
                }
                resolve(convertedValue);
            });
        });
    }

    /**
     * Database statistics
     */
    async getStats() {
        return new Promise((resolve, reject) => {
            const stats = {};
            let completed = 0;
            const queries = 4;
            
            // Count peers
            this.db.get('SELECT COUNT(*) as count FROM peers', [], (err, row) => {
                if (err) reject(err);
                else {
                    stats.peers = row.count;
                    completed++;
                    if (completed === queries) resolve(stats);
                }
            });
            
            // Count topics
            this.db.get('SELECT COUNT(*) as count FROM topics', [], (err, row) => {
                if (err) reject(err);
                else {
                    stats.topics = row.count;
                    completed++;
                    if (completed === queries) resolve(stats);
                }
            });
            
            // Count messages
            this.db.get('SELECT COUNT(*) as count FROM messages', [], (err, row) => {
                if (err) reject(err);
                else {
                    stats.messages = row.count;
                    completed++;
                    if (completed === queries) resolve(stats);
                }
            });
            
            // Count files
            this.db.get('SELECT COUNT(*) as count FROM files', [], (err, row) => {
                if (err) reject(err);
                else {
                    stats.files = row.count;
                    if (fs.existsSync(this.dbPath)) {
                        stats.dbSize = fs.statSync(this.dbPath).size;
                    }
                    completed++;
                    if (completed === queries) resolve(stats);
                }
            });
        });
    }

    /**
     * Close database connection
     */
    close() {
        return new Promise((resolve) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        console.error('Error closing database:', err);
                    } else {
                        console.log('Database connection closed');
                    }
                    this.db = null;
                    this.isInitialized = false;
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}

module.exports = DatabaseManager;
