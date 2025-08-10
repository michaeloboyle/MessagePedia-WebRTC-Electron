const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

/**
 * AI-Enhanced File Distribution System with Autonomous Agent Support
 * 
 * Features:
 * - Intelligent chunking with AI-optimized sizes
 * - Smart peer selection using ML models
 * - Content analysis for automatic categorization
 * - Autonomous agent file management
 * - Predictive pre-loading of related content
 */
class FileDistributionManager extends EventEmitter {
  constructor(p2pNetworkManager, database, options = {}) {
    super();
    this.p2pManager = p2pNetworkManager;
    this.database = database;
    
    // Configuration with AI optimization
    this.config = {
      chunkSize: options.chunkSize || 64 * 1024, // 64KB default
      maxConcurrentDownloads: options.maxConcurrentDownloads || 5,
      retryAttempts: options.retryAttempts || 3,
      // AI-enhanced configuration
      useAdaptiveChunking: options.useAdaptiveChunking !== false,
      enableContentAnalysis: options.enableContentAnalysis !== false,
      smartPeerSelection: options.smartPeerSelection !== false,
      autonomousFileManagement: options.autonomousFileManagement !== false
    };
    
    // Active transfers tracking
    this.activeTransfers = new Map(); // fileId -> TransferState
    this.downloadQueue = new Map(); // priority queue for downloads
    this.uploadQueue = new Map(); // priority queue for uploads
    
    // AI models and agents
    this.aiModels = new Map();
    this.autonomousAgents = new Map();
    this.fileAnalyzer = null;
    
    // Performance metrics for AI optimization
    this.performanceMetrics = {
      peerPerformance: new Map(), // peerId -> performance stats
      chunkPerformance: new Map(), // chunkSize -> performance stats
      networkConditions: new Map() // timestamp -> network stats
    };
    
    this.setupEventHandlers();
    this.initializeAIComponents();
  }

  /**
   * Initialize AI components and models
   */
  async initializeAIComponents() {
    try {
      // Load lightweight AI models for file management
      const AIHelper = require('../ai/AIHelper');
      this.aiHelper = new AIHelper();
      
      // Initialize content analyzer
      this.fileAnalyzer = {
        analyzeContent: this.analyzeFileContent.bind(this),
        categorizeFile: this.categorizeFile.bind(this),
        extractMetadata: this.extractFileMetadata.bind(this),
        predictRelated: this.predictRelatedFiles.bind(this)
      };
      
      // Initialize autonomous agents
      if (this.config.autonomousFileManagement) {
        await this.initializeAutonomousAgents();
      }
      
      console.log('🧠 AI components initialized for file management');
    } catch (error) {
      console.warn('⚠️ AI components failed to initialize:', error);
      // Fallback to non-AI mode
      this.fileAnalyzer = this.createFallbackAnalyzer();
    }
  }

  /**
   * Initialize autonomous agents for file management
   */
  async initializeAutonomousAgents() {
    // File Organizer Agent
    this.autonomousAgents.set('organizer', {
      name: 'File Organizer',
      purpose: 'Automatically organize and categorize files',
      active: true,
      process: this.autonomousOrganizeFiles.bind(this),
      schedule: 60000 // Run every minute
    });
    
    // Predictive Downloader Agent  
    this.autonomousAgents.set('predictor', {
      name: 'Predictive Downloader',
      purpose: 'Pre-download files user is likely to need',
      active: true,
      process: this.autonomousPredictiveDownload.bind(this),
      schedule: 300000 // Run every 5 minutes
    });
    
    // Cache Optimizer Agent
    this.autonomousAgents.set('optimizer', {
      name: 'Cache Optimizer', 
      purpose: 'Optimize file cache based on usage patterns',
      active: true,
      process: this.autonomousOptimizeCache.bind(this),
      schedule: 900000 // Run every 15 minutes
    });
    
    // Start autonomous agents
    this.startAutonomousAgents();
  }

  /**
   * Share a file with AI-enhanced processing
   */
  async shareFile(filePath, topicId, options = {}) {
    const startTime = Date.now();
    const fileStats = await fs.stat(filePath);
    const fileId = this.generateFileId(filePath, fileStats);
    
    console.log(`📤 Sharing file: ${path.basename(filePath)} (${fileStats.size} bytes)`);
    
    // AI-powered content analysis
    let contentAnalysis = null;
    if (this.config.enableContentAnalysis) {
      try {
        contentAnalysis = await this.fileAnalyzer.analyzeContent(filePath, fileStats);
        console.log(`🧠 Content analysis: ${contentAnalysis.category} (confidence: ${contentAnalysis.confidence})`);
      } catch (error) {
        console.warn('Content analysis failed:', error);
      }
    }
    
    // AI-optimized chunking strategy
    const chunkSize = this.calculateOptimalChunkSize(fileStats.size, contentAnalysis);
    const totalChunks = Math.ceil(fileStats.size / chunkSize);
    
    console.log(`📦 Using ${chunkSize} byte chunks (${totalChunks} total)`);
    
    // Create chunks with AI-enhanced metadata
    const chunks = [];
    for (let i = 0; i < totalChunks; i++) {
      const startByte = i * chunkSize;
      const endByte = Math.min(startByte + chunkSize, fileStats.size);
      const chunkData = await this.readFileChunk(filePath, startByte, endByte);
      const chunkHash = crypto.createHash('sha256').update(chunkData).digest('hex');
      
      chunks.push({
        id: chunkHash,
        index: i,
        size: chunkData.length,
        hash: chunkHash,
        priority: this.calculateChunkPriority(i, totalChunks, contentAnalysis),
        // AI-enhanced chunk metadata
        contentType: contentAnalysis?.chunkTypes?.[i] || 'data',
        criticality: this.calculateChunkCriticality(i, totalChunks)
      });
      
      // Store chunk locally
      await this.storeChunk(chunkHash, chunkData);
    }
    
    // Create enhanced file manifest
    const manifest = {
      fileId,
      name: path.basename(filePath),
      size: fileStats.size,
      mimeType: this.getMimeType(filePath),
      chunks,
      created: Date.now(),
      sharer: this.p2pManager.peerId,
      topicId,
      // AI enhancements
      contentAnalysis,
      chunkingStrategy: {
        size: chunkSize,
        adaptive: this.config.useAdaptiveChunking,
        reasoning: `Optimized for ${contentAnalysis?.category || 'general'} content`
      },
      // Autonomous agent metadata
      autonomousMetadata: {
        priority: options.priority || this.calculateFilePriority(contentAnalysis),
        category: contentAnalysis?.category || 'uncategorized',
        tags: contentAnalysis?.tags || [],
        relatedFiles: contentAnalysis?.relatedFiles || []
      }
    };
    
    // Store manifest
    await this.database.storeFileManifest(manifest);
    
    // Announce to topic with AI insights
    const announcementData = {
      manifest,
      aiInsights: {
        category: contentAnalysis?.category,
        summary: contentAnalysis?.summary,
        recommendedFor: contentAnalysis?.recommendedFor || []
      }
    };
    
    // Smart peer selection for announcement
    const targetPeers = this.config.smartPeerSelection 
      ? await this.selectOptimalPeers(topicId, manifest)
      : this.getTopicPeers(topicId);
    
    targetPeers.forEach(peerId => {
      this.p2pManager.sendMessage(peerId, 'file-available', announcementData);
    });
    
    const shareTime = Date.now() - startTime;
    console.log(`✅ File shared in ${shareTime}ms to ${targetPeers.length} peers`);
    
    this.emit('file-shared', { fileId, manifest, shareTime, targetPeers: targetPeers.length });
    
    return fileId;
  }

  /**
   * Download a file with AI-enhanced peer selection
   */
  async downloadFile(fileId, savePath, options = {}) {
    const manifest = await this.database.getFileManifest(fileId);
    if (!manifest) {
      throw new Error(`File manifest not found: ${fileId}`);
    }
    
    console.log(`📥 Downloading: ${manifest.name} (${manifest.size} bytes)`);
    
    const transferState = {
      fileId,
      manifest,
      savePath,
      downloadedChunks: new Set(),
      inProgressChunks: new Map(),
      availablePeers: new Set(),
      startTime: Date.now(),
      pauseRequested: false,
      // AI enhancements
      peerPerformance: new Map(),
      adaptiveStrategy: this.config.smartPeerSelection,
      priority: options.priority || manifest.autonomousMetadata?.priority || 'normal'
    };
    
    this.activeTransfers.set(fileId, transferState);
    
    // Discover peers with chunks using AI-enhanced selection
    await this.discoverChunkAvailability(transferState);
    
    // Start AI-optimized parallel download
    const downloadPromise = this.executeDownloadStrategy(transferState);
    
    // Monitor and adapt strategy in real-time
    if (this.config.smartPeerSelection) {
      this.monitorAndAdaptDownload(transferState);
    }
    
    return downloadPromise;
  }

  /**
   * AI-optimized download execution strategy
   */
  async executeDownloadStrategy(transferState) {
    const { manifest, fileId } = transferState;
    const totalChunks = manifest.chunks.length;
    
    try {
      // Sort chunks by priority (AI-enhanced)
      const chunksToDownload = manifest.chunks
        .filter(chunk => !transferState.downloadedChunks.has(chunk.id))
        .sort((a, b) => (b.priority || 0) - (a.priority || 0));
      
      // Parallel download with smart concurrency
      const concurrency = this.calculateOptimalConcurrency(transferState);
      const chunkPromises = [];
      
      for (let i = 0; i < Math.min(concurrency, chunksToDownload.length); i++) {
        chunkPromises.push(this.downloadNextChunk(transferState));
      }
      
      // Execute download with progress monitoring
      while (transferState.downloadedChunks.size < totalChunks && !transferState.pauseRequested) {
        await Promise.race(chunkPromises.filter(Boolean));
        
        // Replace completed downloads with new ones
        for (let i = 0; i < chunkPromises.length; i++) {
          if (!chunkPromises[i] || await this.isPromiseSettled(chunkPromises[i])) {
            if (transferState.downloadedChunks.size < totalChunks) {
              chunkPromises[i] = this.downloadNextChunk(transferState);
            }
          }
        }
        
        // Emit progress
        const progress = transferState.downloadedChunks.size / totalChunks;
        this.emit('download-progress', { fileId, progress, transferState });
      }
      
      if (transferState.pauseRequested) {
        this.emit('download-paused', { fileId, transferState });
        return null;
      }
      
      // Assemble file
      const assembledPath = await this.assembleFile(transferState);
      
      // AI-powered post-processing
      if (this.config.enableContentAnalysis) {
        await this.postProcessDownload(assembledPath, manifest);
      }
      
      const downloadTime = Date.now() - transferState.startTime;
      const avgSpeed = manifest.size / downloadTime * 1000; // bytes per second
      
      console.log(`✅ Download complete: ${manifest.name} (${avgSpeed.toFixed(0)} B/s)`);
      
      this.activeTransfers.delete(fileId);
      this.emit('download-complete', { fileId, path: assembledPath, downloadTime, avgSpeed });
      
      return assembledPath;
      
    } catch (error) {
      console.error(`❌ Download failed: ${manifest.name}`, error);
      this.emit('download-error', { fileId, error });
      throw error;
    }
  }

  /**
   * AI-powered content analysis for files
   */
  async analyzeFileContent(filePath, fileStats) {
    const ext = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath);
    
    // Basic analysis that can be enhanced with ML models
    const analysis = {
      category: this.categorizeByExtension(ext),
      confidence: 0.7,
      mimeType: this.getMimeType(filePath),
      size: fileStats.size,
      tags: this.generateTags(fileName, ext),
      summary: `${fileName} (${ext} file, ${this.formatFileSize(fileStats.size)})`,
      recommendedFor: [],
      relatedFiles: [],
      chunkTypes: [] // For adaptive chunking
    };
    
    // Enhanced analysis for specific file types
    if (this.isTextFile(ext)) {
      analysis.textAnalysis = await this.analyzeTextFile(filePath);
    } else if (this.isMediaFile(ext)) {
      analysis.mediaAnalysis = await this.analyzeMediaFile(filePath);
    }
    
    return analysis;
  }

  /**
   * Calculate optimal chunk size based on AI analysis
   */
  calculateOptimalChunkSize(fileSize, contentAnalysis) {
    let baseSize = this.config.chunkSize;
    
    if (!this.config.useAdaptiveChunking || !contentAnalysis) {
      return baseSize;
    }
    
    // AI-driven chunk size optimization
    const category = contentAnalysis.category;
    const multipliers = {
      'text': 0.5,        // Smaller chunks for text files
      'image': 1.5,       // Larger chunks for images
      'video': 2.0,       // Much larger chunks for video
      'code': 0.75,       // Medium chunks for code
      'document': 1.0,    // Default for documents
      'archive': 1.5      // Larger for archives
    };
    
    const multiplier = multipliers[category] || 1.0;
    let optimizedSize = Math.floor(baseSize * multiplier);
    
    // Size-based adjustments
    if (fileSize < 1024 * 1024) { // < 1MB
      optimizedSize = Math.min(optimizedSize, 16 * 1024); // Max 16KB chunks
    } else if (fileSize > 100 * 1024 * 1024) { // > 100MB
      optimizedSize = Math.max(optimizedSize, 256 * 1024); // Min 256KB chunks
    }
    
    return optimizedSize;
  }

  /**
   * AI-powered peer selection for optimal downloads
   */
  async selectOptimalPeers(topicId, manifest) {
    const allPeers = this.getTopicPeers(topicId);
    
    if (!this.config.smartPeerSelection || allPeers.length <= 3) {
      return allPeers;
    }
    
    // Score peers based on performance history
    const peerScores = allPeers.map(peerId => {
      const performance = this.performanceMetrics.peerPerformance.get(peerId) || {
        avgSpeed: 0,
        reliability: 0.5,
        latency: 1000
      };
      
      // Calculate composite score
      const speedScore = Math.min(performance.avgSpeed / (1024 * 1024), 10) / 10; // Normalize to 0-1
      const reliabilityScore = performance.reliability;
      const latencyScore = Math.max(0, 1 - (performance.latency / 1000)); // Lower latency = higher score
      
      const compositeScore = (speedScore * 0.4) + (reliabilityScore * 0.4) + (latencyScore * 0.2);
      
      return { peerId, score: compositeScore };
    });
    
    // Select top performers
    const selectedPeers = peerScores
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(5, Math.ceil(allPeers.length * 0.7))) // Top 70% or 5 peers max
      .map(p => p.peerId);
    
    console.log(`🧠 AI selected ${selectedPeers.length} optimal peers from ${allPeers.length} available`);
    
    return selectedPeers;
  }

  /**
   * Autonomous file organization agent
   */
  async autonomousOrganizeFiles() {
    console.log('🤖 Autonomous file organizer running...');
    
    try {
      const manifests = await this.database.getAllFileManifests();
      const unorganized = manifests.filter(m => 
        !m.autonomousMetadata?.organized && 
        m.contentAnalysis?.category
      );
      
      for (const manifest of unorganized) {
        const category = manifest.contentAnalysis.category;
        const suggestedPath = this.suggestOrganizedPath(manifest);
        
        // Create organization suggestion event
        this.emit('autonomous-organization-suggestion', {
          fileId: manifest.fileId,
          fileName: manifest.name,
          currentPath: 'Downloads',
          suggestedPath,
          category,
          confidence: manifest.contentAnalysis.confidence,
          reasoning: `Detected as ${category} content`
        });
        
        // Mark as processed
        manifest.autonomousMetadata.organized = true;
        await this.database.storeFileManifest(manifest);
      }
      
    } catch (error) {
      console.warn('Autonomous organizer error:', error);
    }
  }

  /**
   * Autonomous predictive download agent
   */
  async autonomousPredictiveDownload() {
    console.log('🤖 Predictive downloader analyzing patterns...');
    
    try {
      const recentActivity = await this.database.getRecentFileActivity(24); // Last 24 hours
      const patterns = this.analyzeUsagePatterns(recentActivity);
      
      // Predict files user might need
      const predictions = this.generateDownloadPredictions(patterns);
      
      for (const prediction of predictions) {
        if (prediction.confidence > 0.7) {
          this.emit('autonomous-download-suggestion', {
            fileId: prediction.fileId,
            fileName: prediction.fileName,
            confidence: prediction.confidence,
            reasoning: prediction.reasoning,
            estimatedUse: prediction.estimatedUse
          });
          
          // Auto-download high-confidence predictions if enabled
          if (prediction.confidence > 0.9) {
            console.log(`🤖 Auto-downloading high-confidence prediction: ${prediction.fileName}`);
            this.downloadFile(prediction.fileId, `/tmp/predictive/${prediction.fileName}`, {
              priority: 'low',
              autonomous: true
            }).catch(err => console.warn('Predictive download failed:', err));
          }
        }
      }
      
    } catch (error) {
      console.warn('Predictive downloader error:', error);
    }
  }

  /**
   * Start autonomous agents
   */
  startAutonomousAgents() {
    this.autonomousAgents.forEach((agent, name) => {
      if (agent.active) {
        console.log(`🤖 Starting autonomous agent: ${agent.name}`);
        
        const runAgent = async () => {
          try {
            await agent.process();
          } catch (error) {
            console.warn(`Autonomous agent ${agent.name} error:`, error);
          }
        };
        
        // Run immediately then on schedule
        runAgent();
        agent.interval = setInterval(runAgent, agent.schedule);
      }
    });
  }

  /**
   * Enhanced UX event handlers for autonomous agents
   */
  setupEventHandlers() {
    this.p2pManager.on('message', async (data) => {
      if (data.message.type === 'file-available') {
        await this.handleFileAnnouncement(data.peerId, data.message.data);
      } else if (data.message.type === 'chunk-request') {
        await this.handleChunkRequest(data.peerId, data.message.data);
      }
    });
    
    // Enhanced UX events for AI and autonomous features
    this.on('autonomous-organization-suggestion', (suggestion) => {
      console.log(`🤖💡 File organization suggestion: ${suggestion.fileName} → ${suggestion.suggestedPath}`);
    });
    
    this.on('autonomous-download-suggestion', (suggestion) => {
      console.log(`🤖📥 Predictive download suggestion: ${suggestion.fileName} (${suggestion.confidence * 100}% confidence)`);
    });
  }

  // Helper methods for AI functionality
  categorizeByExtension(ext) {
    const categories = {
      '.txt': 'text', '.md': 'text', '.rtf': 'text',
      '.jpg': 'image', '.png': 'image', '.gif': 'image', '.svg': 'image',
      '.mp4': 'video', '.avi': 'video', '.mov': 'video',
      '.mp3': 'audio', '.wav': 'audio', '.flac': 'audio',
      '.pdf': 'document', '.doc': 'document', '.docx': 'document',
      '.js': 'code', '.ts': 'code', '.py': 'code', '.java': 'code',
      '.zip': 'archive', '.tar': 'archive', '.gz': 'archive'
    };
    return categories[ext] || 'unknown';
  }

  generateTags(fileName, ext) {
    const tags = [this.categorizeByExtension(ext)];
    
    // Extract tags from filename
    const words = fileName.toLowerCase().split(/[^a-z0-9]+/);
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    
    words.forEach(word => {
      if (word.length > 2 && !commonWords.includes(word)) {
        tags.push(word);
      }
    });
    
    return [...new Set(tags)]; // Remove duplicates
  }

  formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  isTextFile(ext) {
    return ['.txt', '.md', '.json', '.xml', '.html', '.css', '.js', '.ts', '.py'].includes(ext);
  }

  isMediaFile(ext) {
    return ['.jpg', '.png', '.gif', '.mp4', '.avi', '.mp3', '.wav'].includes(ext);
  }

  // Additional methods would continue here...
  // (Implementation continues with remaining methods)
  
  async shutdown() {
    console.log('🔚 Shutting down File Distribution Manager');
    
    // Stop autonomous agents
    this.autonomousAgents.forEach((agent, name) => {
      if (agent.interval) {
        clearInterval(agent.interval);
        console.log(`🤖 Stopped autonomous agent: ${agent.name}`);
      }
    });
    
    // Cancel active transfers
    this.activeTransfers.clear();
    
    this.emit('shutdown');
  }
}

module.exports = FileDistributionManager;
