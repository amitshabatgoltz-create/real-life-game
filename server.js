const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// כל שחקן מחובר נשמר כאן בזיכרון: { id, name, x, y, z, rotY }
const players = new Map();

// מצב המכונית המשותפת - יחידה אחת לכולם
const carState = { x: -10, y: 0, z: 15, rotY: Math.PI / 3, driverId: null, passengerId: null };

io.on('connection', (socket) => {
  const id = socket.id;

  socket.on('join', (data) => {
    const name = (data && data.name ? data.name : 'שחקן').toString().slice(0, 20);
    const state = { id, name, x: 0, y: 0, z: 0, rotY: 0 };
    players.set(id, state);

    // שולח לשחקן החדש את כל השחקנים הקיימים
    socket.emit('init', {
      selfId: id,
      players: Array.from(players.values())
    });
    socket.emit('carState', carState);

    // מודיע לכולם (חוץ ממנו) שיש שחקן חדש
    socket.broadcast.emit('playerJoined', { player: state });
    console.log(`שחקן הצטרף: ${name} (${id}) | מחוברים: ${players.size}`);
  });

  socket.on('move', (data) => {
    const p = players.get(id);
    if (!p) return;
    p.x = data.x; p.y = data.y; p.z = data.z; p.rotY = data.rotY;
    socket.broadcast.emit('playerMoved', {
      id, x: p.x, y: p.y, z: p.z, rotY: p.rotY,
      moving: !!data.moving, running: !!data.running, jumped: !!data.jumped
    });
  });

  socket.on('enterCarRequest', () => {
    if (!carState.driverId) {
      carState.driverId = id;
    } else if (!carState.passengerId && carState.driverId !== id) {
      carState.passengerId = id;
    }
    // אם שני המקומות תפוסים (ולא על ידי השחקן הזה) - הבקשה פשוט מתעלמת
    io.emit('carState', carState);
  });

  socket.on('exitCarRequest', () => {
    if (carState.driverId === id) carState.driverId = null;
    if (carState.passengerId === id) carState.passengerId = null;
    io.emit('carState', carState);
  });

  socket.on('carMove', (data) => {
    if (carState.driverId !== id) return; // רק הנהג יכול לעדכן את מיקום הרכב
    carState.x = data.x; carState.y = data.y; carState.z = data.z; carState.rotY = data.rotY;
    socket.broadcast.emit('carMoved', carState);
  });

  socket.on('disconnect', () => {
    if (players.has(id)) {
      console.log(`שחקן התנתק: ${players.get(id).name} (${id})`);
      players.delete(id);
      io.emit('playerLeft', { id });
    }
    // אם הנהג/נוסע התנתק תוך כדי נסיעה - משחררים את המקום
    let carChanged = false;
    if (carState.driverId === id) { carState.driverId = null; carChanged = true; }
    if (carState.passengerId === id) { carState.passengerId = null; carChanged = true; }
    if (carChanged) io.emit('carState', carState);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Real Life server running on port ${PORT}`);
});

// כל 3 שניות משדרים לכולם את רשימת השחקנים המלאה - מתקן אוטומטית כל אי-סנכרון
setInterval(() => {
  io.emit('playersSync', Array.from(players.values()));
  io.emit('carState', carState);
}, 3000);
