const CryptoJS = require('crypto-js');
const EC = require('elliptic');
const ec = new EC.ec('secp256k1');

const systemSender = ['system-coinbase', 'system-sender'];
const enumSysSender = {
  COIN_BASE: 'system-coinbase',
  COIN_SYSTEM: 'system-sender',
};

const K_SYS = ec.keyFromPrivate('01');
const K_COINBASE = ec.keyFromPrivate('02');

class Transaction {
  constructor(txIns = [], txOuts = [], hash = '') {
    this.txIns = [];
    this.txOuts = [];
    this.hash = '';
  }

  parseTrasaction({ txIns, txOuts, hash }) {
    this.txIns = txIns;
    this.txOuts = txOuts;
    this.hash = hash;
  }

  hashTransaction() {
    const stringTxIn = this.txIns
      .map((txIn) => {
        return txIn.txOutId + txIn.txOutIndex;
      })
      .reduce((a, b) => a + b, '');
    const stringTxOut = this.txOuts
      .map((txOut) => {
        return txOut.amount.toString() + txOut.address;
      })
      .reduce((a, b) => a + b, '');

    const hash = CryptoJS.SHA256(stringTxIn + stringTxOut + new Date().getTime().toString()).toString();
    this.hash = hash;
    return hash;
  }

  gererateTxIns(sender, amount, uTxOuts) {
    const txIns = [];

    if (systemSender.includes(sender)) {
      const index = sender === enumSysSender.COIN_SYSTEM ? 0 : 1;
      txIns.push(new TxIn('0', index));
      this.txIns = txIns;
      return {
        txIns,
        txInBalance: amount,
      };
    }

    let currentCoin = 0;
    let index = 0;
    uTxOuts.forEach((uTxOut) => {
      if (uTxOut.status === 1) {
        currentCoin += uTxOut.amount;
        txIns.push(new TxIn(uTxOut.txOutId, index));
        index++;
        if (currentCoin >= amount) {
          this.txIns = txIns;
          return;
        }
      }
    });
    return {
      txIns,
      txInBalance: currentCoin,
    };
  }

  gererateTxOuts(sender, recipient, txInBalance, amount) {
    const txOuts = [];

    if (systemSender.includes(sender)) {
      const uTxOut = new UnspentTxOut({ from: sender, address: recipient, amount: +amount });
      txOuts.push(uTxOut);
    } else {
      const uTxOut = new UnspentTxOut({ from: sender, address: recipient, amount: +amount });
      txOuts.push(uTxOut);
      const refund = txInBalance - amount;

      if (refund > 0) {
        const uTxOutrefund = new UnspentTxOut({ from: sender, address: sender, amount: refund });

        txOuts.push(uTxOutrefund);
      }
    }

    this.txOuts = txOuts;
    return txOuts;
  }

  updateTxOuts(hashTx) {
    this.txOuts.forEach((txOut, index) => {
      txOut.txOutIndex = index;
      txOut.hashUnspentTxOut(hashTx);
    });
    return this.txOuts;
  }

  signAllTxIns(privateKey, unspenTxOut) {
    this.txIns.forEach((txIn) => {
      txIn.signTxIn(this.hash, privateKey, unspenTxOut);
    });
  }
}

class TxIn {
  constructor(txOutId, txOutIndex) {
    this.txOutId = txOutId;
    this.txOutIndex = txOutIndex;
    this.signature = '';
  }

  signTxIn(hashTx, privateKey, unspentTxOuts) {
    const dataToSign = hashTx;
    let key = ec.keyFromPrivate(privateKey, 'hex');
    if (this.txOutId === '0') {
      key = ec.keyFromPrivate('1', 'hex');
      const signature = key.sign(dataToSign).toDER('hex');
      this.signature = signature;
      return signature;
    }
    const refUTxOut = unspentTxOuts.filter((uTxOut) => uTxOut.txOutId === this.txOutId)[0];
    if (refUTxOut.length === 0) {
      console.log('could not find TxOut');
      return;
    }

    if (key.getPublic('hex') !== refUTxOut.address) {
      console.log('TxIn not Math address');
      return;
    }
    const signature = key.sign(dataToSign).toDER('hex');
    this.signature = signature;
    return signature;
  }
}

class UnspentTxOut {
  constructor({ from, address, amount }) {
    this.txOutId = '';
    this.txOutIndex = 0;
    this.address = address;
    this.amount = amount;
    this.status = 1;
    this.from = from;
  }

  hashUnspentTxOut(hashTx) {
    const stringHash = `${hashTx}${this.TxOutIndex}${this.address}${this.amount}${Date.now()}`;
    const hash = CryptoJS.SHA256(stringHash).toString();
    this.txOutId = hash;
    return hash;
  }
}

module.exports = Transaction;
