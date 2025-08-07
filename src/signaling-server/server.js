const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// TODO: Implement signaling server logic
// - Peer discovery and registration
// - WebRTC offer/answer relay
// - Room/topic management

const rooms = new Map();
const peers = new Map();

io.on('connection', (socket) => {
  console.log('Peer connected:', socket.id);
  
  socket.on('join-room', (roomId) => {
    console.log(\`Peer \${socket.id} joining room \${roomId}\`);
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(socket.id);
    
    // Notify other peers in the room
    socket.to(roomId).emit('peer-joined', {
      peerId: socket.id,
      timestamp: Date.now()
    });
  });
  
  socket.on('leave-room', (roomId) => {
    console.log(\`Peer \${socket.id} leaving room \${roomId}\`);
    socket.leave(roomId);
    
    if (rooms.has(roomId)) {
      rooms.get(roomId).delete(socket.id);
      if (rooms.get(roomId).size === 0) {
        rooms.delete(roomId);
      }
    }
    
    socket.to(roomId).emit('peer-left', {
      peerId: socket.id,
      timestamp: Date.now()
    });
  });
  
  socket.on('webrtc-signal', (data) => {
    console.log(\`Relaying WebRTC signal from \${socket.id} to \${data.targetPeer}\`);
    socket.to(data.targetPeer).emit('webrtc-signal', {
      fromPeer: socket.id,
      signal: data.signal,
      timestamp: Date.now()
    });
  });
  
  socket.on('disconnect', () => {
    console.log('Peer disconnected:', socket.id);
    
    // Clean up rooms
    for (const [roomId, peerSet] of rooms.entries()) {
      if (peerSet.has(socket.id)) {
        peerSet.delete(socket.id);
        socket.to(roomId).emit('peer-left', {
          peerId: socket.id,
          timestamp: Date.now()
        });
        
        if (peerSet.size === 0) {
          rooms.delete(roomId);
        }
      }
    }
    
    peers.delete(socket.id);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(\`MessagePedia Signaling Server running on port \${PORT}\`);
  console.log('Rooms:', rooms.size);
  console.log('Connected peers:', peers.size);
});
