class Block {
  constructor(index, prevHash, hash, transactions, timeStamp, difficult, nonce, minner = null) {
    this.index = index;
    this.transactions = transactions;
    this.timeStamp = timeStamp;
    this.prevHash = prevHash;
    this.hash = hash;
    this.difficult = difficult;
    this.nonce = nonce;
    this.minner = minner;
  }
}

module.exports = Block;
