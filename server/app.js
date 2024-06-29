const express = require('express');
const http = require('http');
const cors = require('cors');
const socket = require('socket.io');
const app = express();
const axios = require('axios');

const { Blockchain, systemKey, enumSysSender } = require('./src/models/blockchain');
const event = require('./src/constants/event');

const PORT = 4000;
app.use(express.json());
app.use(cors());
const server = http.createServer(app);
const io = socket(server, {
  cors: {
    origin: [`http://localhost:3000`, `http://192.168.43.217:3000`],
    methods: ['GET', 'POST'],
  },
});

const blockchain = new Blockchain(io);

app.get('/', (req, res) => {
  res.send('hello world!!');
});

app.get('/blocks', (req, res) => {
  res.json(blockchain.getBlockChain());
});

app.post('/transactions', (req, res) => {
  blockchain.addTransaction(req.body);
  io.emit(event.ADD_TRANSACTION, req.body);
  if (blockchain.checkMine()) {
    blockchain.setMine(true);
    setTimeout(() => {
      const lastBlock = blockchain.getLastBlock();
      io.emit(event.START_MINING, {
        index: lastBlock.index + 1,
        transactions: blockchain.getPendingTransactions(),
        timeStamp: new Date().toString(),
        prevHash: lastBlock.hash,
      });
    }, 1000);
  }
  res.json({ message: 'add transaction success' }).end();
});

app.get('/transactions', (req, res) => {
  return res.status(200).json(
    blockchain.getTransactions().sort(function (x, y) {
      return x.timeStamp - y.timeStamp;
    })
  );
});

app.post('/transactions/buycoin', async (req, res) => {
  const { address, amount } = req.body;

  const systemSend = await blockchain.generateTransaction(
    enumSysSender.COIN_SYSTEM,
    address,
    amount,
    systemKey.getPrivate('hex')
  );
  await axios.post('http://localhost:9080/transactions', systemSend);

  res.json({ message: 'add transaction success' }).end();
});

app.get('/transactions/:address', (req, res) => {
  res.json(blockchain.getTransactionsByAddress(req.params.address));
});

app.get('/blocks/lastblock', (req, res) => {
  res.json({ lastBlock: blockchain.getLastBlock() });
});

app.post('/blocks/mining', (req, res) => {
  if (res.body !== undefined && res.body.length > 0) {
    setTimeout(() => {
      const lastBlock = blockchain.getLastBlock();
      io.emit(event.START_MINING, {
        index: lastBlock.index + 1,
        transactions: res.body,
        timeStamp: new Date().toString(),
        prevHash: lastBlock.hash,
      });
    }, 1000);
  }
  blockchain.setMine(true);
  res.json({ message: 'add transaction success' }).end();
});

app.get('/hashblocks/:id', (req, res) => {
  res.json({ hash: blockchain.hashBlock(blockchain.blocks[+req.params.id]) });
});

app.get('/balance/:address', (req, res) => {
  res.json({ balance: blockchain.getBalance(req.params.address) });
});

app.get('/unspentTxOuts', (req, res) => {
  res.json({ unspentTxOuts: blockchain.getUnspentTxOuts() });
});

app.get('/pendingTransactions', (req, res) => {
  res.json({ pendingTransactions: blockchain.getPendingTransactions() });
});

io.on('connection', (socket) => {
  console.log(`Socket connected, ID: ${socket.id}`);
  blockchain.addNode(socket);
  socket.emit(event.ADD_NODE, {
    blocks: blockchain.getBlockChain(),
    pendingTransactions: blockchain.getPendingTransactions(),
    unspentTxOuts: blockchain.getUnspentTxOuts(),
  });
  socket.on(event.BROADCAST_ENDMINING, ({ result }) => {
    result = JSON.parse(result);
    console.log(`broadcast ${socket.id}` + result.toString());
    blockchain.setMine(false);
    blockchain.addBlock(result);
    socket.broadcast.emit(event.END_MINING, result);
    io.emit(event.UPDATE_TRANSACTION, {});
  });
  socket.on('disconnect', () => {
    blockchain.deleteNode(socket);
    console.log(`Socket disconnected, ID: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.info(`Express server running on https://localhost:${PORT}`);
});
