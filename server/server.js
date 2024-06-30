const http = require('http');
const socket = require('socket.io');
const app = require('./src/app');

const PORT = 4000;
const server = http.createServer(app);
const io = socket(server, {
  cors: {
    origin: [`http://localhost:3000`, `http://192.168.43.217:3000`],
    methods: ['GET', 'POST'],
  },
});

const blockchainController = require('./src/controllers/blockchain.controller');
blockchainController.initSocket(io);

server.listen(PORT, () => {
  console.info(`Express server running on https://localhost:${PORT}`);
});
