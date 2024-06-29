const CryptoJS = require('crypto-js');
const EC = require('elliptic');
const ec = new EC.ec('secp256k1');

const Block = require('../models/block');
const Transaction = require('../models/transaction');

const systemSender = ['system-coinbase', 'system-sender'];
const enumSysSender = {
  COIN_BASE: 'system-coinbase',
  COIN_SYSTEM: 'system-sender',
};

const K_SYS = ec.keyFromPrivate('01');
const K_COINBASE = ec.keyFromPrivate('02');

class Blockchain {
  constructor(io) {
    this.pendingTransactions = [];
    this.unspentTxOuts = [];
    this.nodes = [];
    this.difficult = 3;
    this.canMine = false;
    this.reward = 10;
    this.minimumTx = 3;
    this.blocks = [this.getGenesisBlock()];
    this.io = io;
  }

  hashBlock({ index, prevHash, transactions, timeStamp, difficult, nonce }) {
    const stringHash = `${index}${prevHash}` + JSON.stringify(transactions) + `${timeStamp}${difficult}${nonce}`;
    return CryptoJS.SHA256(stringHash).toString();
  }

  proofOfWork(index, transactions, timeStamp, prevHash, nonce) {
    return new Promise((resolve, reject) => {
      setImmediate(async () => {
        if (!this.getMine()) {
          resolve(null);
          return;
        }
        const hashBlock = this.hashBlock({
          index,
          prevHash,
          transactions,
          timeStamp,
          difficult: this.difficult,
          nonce,
        });
        if (this.hashMatchDifficult(hashBlock, this.difficult)) {
          this.setMine(false);
          resolve(new Block(index, prevHash, hashBlock, transactions, timeStamp, this.difficult, nonce));
        }

        resolve(await this.proofOfWork(index, transactions, timeStamp, prevHash, nonce + 1));
      });
    });
  }

  generateTransaction(sender, recipient, amount, privateKey) {
    const newTransaction = new Transaction();
    const uTxOutsByAddress = this.getUTxOutsByAddress(sender);
    if (!this.checkBalance(amount, sender)) {
      console.log('not enought money!!!');
      return;
    }
    const txIns = newTransaction.gererateTxIns(sender, amount, uTxOutsByAddress);
    newTransaction.gererateTxOuts(sender, recipient, txIns.txInBalance, amount);
    const hashTx = newTransaction.hashTransaction();
    newTransaction.updateTxOuts(hashTx);
    newTransaction.signAllTxIns(privateKey, uTxOutsByAddress);
    return newTransaction;
  }

  /////////////////////////// add ///////////////////////////

  async addBlock(newBlock) {
    if (!this.transactionsIsValid(newBlock.transactions)) {
      console.log('Transactions is not valid!!!');
      return;
    }

    if (this.blockIsValid(newBlock)) {
      this.blocks.push(newBlock);
      this.updateUnspentTxOut(newBlock);
      this.pendingTransactions.splice(0, newBlock.transactions.length - 1);
      console.log('success add block into blockchain!!');
    }
  }

  addTransactionReward(address) {
    const rewardTransaction = this.generateTransaction(
      enumSysSender.COIN_BASE,
      address,
      this.reward,
      K_COINBASE.getPrivate('hex')
    );
    return rewardTransaction;
  }

  addTransaction(transaction) {
    this.pendingTransactions.push(transaction);
  }

  addNode(node) {
    this.nodes.push(node);
  }

  /////////////////////////// valid ///////////////////////////
  transactionsIsValid(transactions) {
    let valid = true;
    transactions.forEach((tx) => {
      const newTx = new Transaction(tx);
      for (const txIn of newTx.txIns) {
        if (txIn.txOutId !== '0') {
          const refUTxOut = this.unspentTxOuts.filter((uTxOut) => uTxOut.txOutId === txIn.txOutId);
          if (refUTxOut !== null) {
            const key = ec.keyFromPublic(refUTxOut[0].address, 'hex');
            const newHash = newTx.hashTransaction();
            const valid = key.verify(newHash, txIn.signature);
            if (!valid) {
              return false;
            }
          }
        }
      }
    });
    return valid;
  }

  chainIsValid(blockchain) {
    if (JSON.stringify(blockchain[0]) !== JSON.stringify(this.getGenesisBlock())) {
      console.log('genesisBlock not valid!!');
      return false;
    }

    const tempBlocks = [blockchain[0]];
    for (let i = 1; i < blockchain.length; i++) {
      if (this.blockIsValid(blockchain[i], tempBlocks[i - 1])) {
        tempBlocks.push(blockchain[i]);
      } else {
        console.log('block not valid!!');
        return false;
      }
    }
    return true;
  }

  blockIsValid(newBlock, prevBlock = null) {
    const lastBlock = prevBlock || this.getLastBlock();

    if (+newBlock.index !== lastBlock.index + 1) {
      console.log('invalid index' + newBlock.index);
      return false;
    }

    if (newBlock.prevHash !== lastBlock.hash) {
      console.log('invalid prevhash');
      return false;
    }

    if (newBlock.hash !== this.hashBlock(newBlock)) {
      console.log('invalid hash');
      return false;
    }

    return true;
  }

  checkBalance(amount, address) {
    if (systemSender.includes(address)) return true;
    const Balance = this.getBalance(address);
    if (+Balance < +amount) {
      return false;
    }

    return true;
  }

  hashMatchDifficult(hash, difficult) {
    const difficultString = '0'.repeat(difficult);
    return hash.startsWith(difficultString);
  }

  checkMine() {
    if (this.pendingTransactions.length > this.minimumTx && !this.canMine) {
      return true;
    }
    return false;
  }

  /////////////////////////// get ///////////////////////////

  getBlockChain() {
    return this.blocks;
  }

  getGenesisBlock() {
    let newBlock = new Block(1, '0', '', [], '00:00:01, 01/01/2021', this.difficult, 0);

    newBlock.hash = this.hashBlock(
      newBlock.index,
      newBlock.prevHash,
      newBlock.transactions,
      newBlock.timeStamp,
      newBlock.difficult,
      newBlock.nonce
    );

    return newBlock;
  }

  getMine() {
    return this.canMine;
  }

  getLastBlock() {
    return this.blocks[this.blocks.length - 1];
  }

  getUnspentTxOuts() {
    return this.unspentTxOuts;
  }

  getPendingTransactions() {
    return this.pendingTransactions;
  }

  getBlock(hash) {
    return this.blocks.filter((value) => value.hash === hash);
  }

  getTransactionsByAddress(address) {
    const currentTransactions = [];
    const refUTxOuts = this.unspentTxOuts.filter((uTxOut) => uTxOut.address === address);
    if (refUTxOuts.length !== 0) {
      refUTxOuts.forEach((uTxOut) => {
        this.blocks.forEach((element) => {
          element.transactions.forEach((tx) => {
            let newTx = { hash: tx.hash, timeStamp: element.timeStamp, block: element.index };
            tx.txIns.forEach((txIn) => {
              if (
                txIn.txOutId === '0' &&
                tx.txOuts[0].address === uTxOut.address &&
                tx.txOuts.length <= 1 &&
                tx.txOuts[0].amount === uTxOut.amount
              ) {
                newTx = {
                  ...newTx,
                  from: `${txIn.txOutIndex === 0 ? 'system send' : 'coinbase (reward)'}`,
                };
              }
              if (uTxOut.txOutId === txIn.txOutId) {
                newTx = { ...newTx, from: uTxOut.address };
              }
            });
            if (uTxOut.txOutId === tx.txOuts[0].txOutId) {
              const sender = this.unspentTxOuts.filter((uTxOut) => uTxOut.txOutId === tx.txIns[0].txOutId);
              if (sender.length !== 0) {
                newTx = { ...newTx, from: sender[0].address };
              }
            }
            newTx = { ...newTx, to: tx.txOuts[0].address, amount: `${tx.txOuts[0].amount}` };

            if (newTx.from && newTx.to) {
              currentTransactions.push(newTx);
            }
          });
        });
        this.pendingTransactions.forEach((pTransaction) => {
          const txIns = pTransaction.txIns.filter((txIn) => txIn.txOutId === uTxOut.txOutId);
          if (txIns.length > 0) {
            let newTx = {
              hash: pTransaction.hash,
              timeStamp: new Date().toString(),
              block: -1,
              from: address,
              to: pTransaction.txOuts[0].address,
              amount: pTransaction.txOuts[0].amount,
            };
            currentTransactions.push(newTx);
          }
        });
      });
    }

    this.pendingTransactions.forEach((pTransaction) => {
      if (pTransaction.txOuts[0].address === address) {
        const sysSend =
          pTransaction.txIns[0].txOutId === '0' && pTransaction.txIns[0].txOutIndex === 0
            ? enumSysSender.COIN_SYSTEM
            : '';
        const txInsSend = this.unspentTxOuts.filter((uTxOut) => pTransaction.txIns[0].txOutId === uTxOut.txOutId);
        let newTx = {
          hash: pTransaction.hash,
          timeStamp: new Date().toString(),
          block: -1,
          from: '',
          to: address,
          amount: pTransaction.txOuts[0].amount,
        };
        if (txInsSend.length > 0) {
          newTx.from = txInsSend.address;
        } else {
          newTx.from = sysSend;
        }
        currentTransactions.push(newTx);
      }
    });

    return currentTransactions.filter(
      (value, index, array) => array.findIndex((element) => JSON.stringify(element) === JSON.stringify(value)) === index
    );
  }

  getUTxOutsByAddress(address) {
    return this.unspentTxOuts.filter((uTxOut) => uTxOut.address === address && uTxOut.status === 1);
  }

  getBalance(address) {
    const uTxOutsOfAddress = this.unspentTxOuts.filter((uTxOut) => uTxOut.address === address && uTxOut.status === 1);
    return uTxOutsOfAddress.reduce((a, b) => a + b.amount, 0);
  }

  getNodes() {
    return this.nodes;
  }

  /////////////////////////// set ///////////////////////////
  setDifficult(value) {
    this.difficult = value;
  }

  setMine(value) {
    this.canMine = value;
  }

  setReward(value) {
    this.reward = value;
  }

  replaceChain(blockchain) {
    if (this.chainIsValid(blockchain) && this.blocks.length < blockchain.length) {
      this.blocks = blockchain;
    }
  }

  /////////////////////////// update ///////////////////////////

  updateUnspentTxOut(block) {
    block.transactions.forEach((tx) => {
      tx.txOuts.forEach((txOut) => {
        this.unspentTxOuts.push({ ...txOut });
      });
      tx.txIns.forEach((txIn) => {
        this.unspentTxOuts.forEach((uTxOut) => {
          if (uTxOut.txOutId === txIn.txOutId) {
            uTxOut.status = 0;
          }
        });
      });
    });
  }

  parseChain(blockchain) {
    this.replaceChain(blockchain.blocks);
    this.unspentTxOuts = blockchain.unspentTxOuts;
    this.pendingTransactions = blockchain.pendingTransactions;
  }

  /////////////////////////// delete ///////////////////////////
  deleteNode(socket) {
    const index = this.nodes.findIndex((value) => {
      return value.id === socket.id;
    });
    this.nodes.splice(index, 1);
  }

  getTransactions() {
    const currentTransactions = [];
    const refUTxOuts = this.unspentTxOuts;
    if (refUTxOuts.length !== 0) {
      refUTxOuts.forEach((uTxOut) => {
        this.blocks.forEach((element) => {
          element.transactions.forEach((tx) => {
            let newTx = { hash: tx.hash, timeStamp: element.timeStamp, block: element.index };
            tx.txIns.forEach((txIn) => {
              if (
                txIn.txOutId === '0' &&
                tx.txOuts[0].address === uTxOut.address &&
                tx.txOuts.length <= 1 &&
                tx.txOuts[0].amount === uTxOut.amount
              ) {
                newTx = {
                  ...newTx,
                  from: `${txIn.txOutIndex === 0 ? 'system send' : 'coinbase (reward)'}`,
                };
              }
              if (uTxOut.txOutId === txIn.txOutId) {
                newTx = { ...newTx, from: uTxOut.address };
              }
            });
            if (uTxOut.txOutId === tx.txOuts[0].txOutId) {
              const sender = this.unspentTxOuts.filter((uTxOut) => uTxOut.txOutId === tx.txIns[0].txOutId);
              if (sender.length !== 0) {
                newTx = { ...newTx, from: sender[0].address };
              }
            }
            newTx = { ...newTx, to: tx.txOuts[0].address, amount: `${tx.txOuts[0].amount}` };

            if (newTx.from && newTx.to) {
              currentTransactions.push(newTx);
            }
          });
        });
        this.pendingTransactions.forEach((pTransaction) => {
          const txIns = pTransaction.txIns.filter((txIn) => txIn.txOutId === uTxOut.txOutId);
          if (txIns.length > 0) {
            let newTx = {
              hash: pTransaction.hash,
              timeStamp: new Date().toString(),
              block: -1,
              from: uTxOut.address,
              to: pTransaction.txOuts[0].address,
              amount: pTransaction.txOuts[0].amount,
            };
            currentTransactions.push(newTx);
          }
        });
      });
    }

    this.pendingTransactions.forEach((pTransaction) => {
      const sysSend =
        pTransaction.txIns[0].txOutId === '0' && pTransaction.txIns[0].txOutIndex === 0
          ? enumSysSender.COIN_SYSTEM
          : '';
      const txInsSend = this.unspentTxOuts.filter((uTxOut) => pTransaction.txIns[0].txOutId === uTxOut.txOutId);
      let newTx = {
        hash: pTransaction.hash,
        timeStamp: new Date().toString(),
        block: -1,
        from: pTransaction.txOuts[0].from,
        to: pTransaction.txOuts[0].address,
        amount: pTransaction.txOuts[0].amount,
      };
      currentTransactions.push(newTx);
    });

    return currentTransactions.filter(
      (value, index, array) => array.findIndex((element) => JSON.stringify(element) === JSON.stringify(value)) === index
    );
  }
}

module.exports = {
  Blockchain,
  systemKey: K_SYS,
  enumSysSender,
};
