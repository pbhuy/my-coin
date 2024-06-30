const express = require('express');
const router = express.Router();

const blockchainController = require('../controllers/blockchain.controller');

router.get('/', (req, res) => {
  res.send('hello world!!');
});

router.get('/blocks', blockchainController.getBlocks);
router.post('/transactions', blockchainController.addTransaction);
router.get('/transactions', blockchainController.getTransactions);
router.post('/transactions/buycoin', blockchainController.buyCoin);
router.get('/transactions/:address', blockchainController.getTransactionsByAddress);
router.get('/blocks/lastblock', blockchainController.getLastBlock);
router.post('/blocks/mining', blockchainController.mineBlock);
router.get('/hashblocks/:id', blockchainController.hashBlock);
router.get('/balance/:address', blockchainController.getBalance);
router.get('/unspentTxOuts', blockchainController.getUnspentTxOuts);
router.get('/pendingTransactions', blockchainController.getPendingTransactions);

module.exports = router;
