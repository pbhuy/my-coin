const { Blockchain, systemKey, enumSysSender } = require('../models/blockchain');
const event = require('../constants/event');
const axios = require('axios');

const blockchain = new Blockchain();

let io;

const initSocket = (socketIo) => {
  io = socketIo;
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
};

const getBlocks = (req, res) => {
  res.json(blockchain.getBlockChain());
};

const addTransaction = (req, res) => {
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
};

const getTransactions = (req, res) => {
  return res.status(200).json(
    blockchain.getTransactions().sort(function (x, y) {
      return x.timeStamp - y.timeStamp;
    })
  );
};

const buyCoin = async (req, res) => {
  const { address, amount } = req.body;
  const systemSend = await blockchain.generateTransaction(
    enumSysSender.COIN_SYSTEM,
    address,
    amount,
    systemKey.getPrivate('hex')
  );
  await axios.post('http://localhost:4000/transactions', systemSend);

  res.json({ message: 'add transaction success' }).end();
};

const getTransactionsByAddress = (req, res) => {
  res.json(blockchain.getTransactionsByAddress(req.params.address));
};

const getLastBlock = (req, res) => {
  res.json({ lastBlock: blockchain.getLastBlock() });
};

const mineBlock = (req, res) => {
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
};

const hashBlock = (req, res) => {
  res.json({ hash: blockchain.hashBlock(blockchain.blocks[+req.params.id]) });
};

const getBalance = (req, res) => {
  res.json({ balance: blockchain.getBalance(req.params.address) });
};

const getUnspentTxOuts = (req, res) => {
  res.json({ unspentTxOuts: blockchain.getUnspentTxOuts() });
};

const getPendingTransactions = (req, res) => {
  res.json({ pendingTransactions: blockchain.getPendingTransactions() });
};

module.exports = {
  initSocket,
  getBlocks,
  addTransaction,
  getTransactions,
  buyCoin,
  getTransactionsByAddress,
  getLastBlock,
  mineBlock,
  hashBlock,
  getBalance,
  getUnspentTxOuts,
  getPendingTransactions,
};
