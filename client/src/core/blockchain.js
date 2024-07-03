const CryptoJS = require('crypto-js');
const EC = require('elliptic');
const ec = new EC.ec('secp256k1');

const systemSender = ['system-coinbase', 'system-sender'];
const enumSysSender = {
    COIN_BASE: 'system-coinbase',
    COIN_SYSTEM: 'system-sender',
}

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

    getBlocks() {
        return this.blocks;
    }

    hashBlock({index, prevHash, transactions, timeStamp, difficult, nonce}) {
        const stringHash = `${index}${prevHash}` +
            JSON.stringify(transactions) +
            `${timeStamp}${difficult}${nonce}`;
        return CryptoJS.SHA256(stringHash).toString();
    }

    proofOfWork(index, transactions, timeStamp, prevHash, nonce) {
        return new Promise((resolve, reject) => {
            let hashBlock = null;

            while (this.getMine()) {
                hashBlock = this.hashBlock({
                    index,
                    prevHash,
                    transactions,
                    timeStamp,
                    difficult: this.difficult,
                    nonce
                });
                if (this.hashMatchDifficult(hashBlock, this.difficult)) {
                    this.setMine(false);
                    resolve(new Block(index, prevHash, hashBlock, transactions, timeStamp, this.difficult, nonce));
                }
                nonce++;
            }
            resolve(null);
        })
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
            this.pendingTransactions = [];
            console.log('success add block into blockchain!!');
        } else {

        }
    }

    addTransactionReward(address) {
        const rewardTransaction = this.generateTransaction(enumSysSender.COIN_BASE, address, this.reward, K_COINBASE.getPrivate('hex'));
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
                    const refUTxOut = this.unspentTxOuts.filter(uTxOut => uTxOut.txOutId === txIn.txOutId);
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
            console.log('invalid index' + newBlock.index + '' + lastBlock.index);
            return false;
        }

        if (newBlock.prevHash !== lastBlock.hash) {
            console.log('invalid prevhash');
            return false;
        }

        console.log(newBlock);
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
        )

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

    getPendingTransactionsOutput() {
        const currentTransactions = [];
        this.pendingTransactions.forEach(pTransaction => {
            let newTx = {
                hash: pTransaction.hash,
                timeStamp: new Date().toString(),
                block: -1,
                from: pTransaction.txOuts[0].from,
                to: pTransaction.txOuts[0].address,
                amount: pTransaction.txOuts[0].amount
            };
            currentTransactions.push(newTx);
        })

        return currentTransactions;
    }

    getPendingTransactions() {
        return this.pendingTransactions;
    }

    getBlock(hash) {
        return this.blocks.filter(value => value.hash === hash);
    }

    getTransactionsByAddress(address) {
        const currentTransactions = [];
        const refUTxOuts = this.unspentTxOuts.filter(uTxOut => uTxOut.address === address);
        if (refUTxOuts.length !== 0) {
            refUTxOuts.forEach(uTxOut => {
                this.blocks.forEach(element => {
                    element.transactions.forEach(tx => {
                        let newTx = {hash: tx.hash, timeStamp: element.timeStamp, block: element.index};
                        tx.txIns.forEach(txIn => {
                            if (txIn.txOutId === '0' && tx.txOuts[0].address === uTxOut.address
                                && tx.txOuts.length <= 1 && tx.txOuts[0].amount === uTxOut.amount) {
                                newTx = {
                                    ...newTx,
                                    from: `${(txIn.txOutIndex === 0) ? 'system send' : 'coinbase (reward)'}`
                                };
                            }
                            if (uTxOut.txOutId === txIn.txOutId) {
                                newTx = {...newTx, from: uTxOut.address};
                            }

                        })
                        if (uTxOut.txOutId === tx.txOuts[0].txOutId) {
                            const sender = this.unspentTxOuts.filter(uTxOut => uTxOut.txOutId === tx.txIns[0].txOutId);
                            if (sender.length !== 0) {
                                newTx = {...newTx, from: sender[0].address};
                            }
                        }
                        newTx = {...newTx, to: tx.txOuts[0].address, amount: `${tx.txOuts[0].amount}`};

                        if (newTx.from && newTx.to) {
                            currentTransactions.push(newTx);
                        }
                    })
                })
                this.pendingTransactions.forEach(pTransaction => {
                    const txIns = pTransaction.txIns.filter(txIn => txIn.txOutId === uTxOut.txOutId);
                    if (txIns.length > 0) {
                        let newTx = {
                            hash: pTransaction.hash,
                            timeStamp: new Date().toString(),
                            block: -1,
                            from: address,
                            to: pTransaction.txOuts[0].address,
                            amount: pTransaction.txOuts[0].amount
                        };
                        currentTransactions.push(newTx);
                    }

                })
            })
        }

        this.pendingTransactions.forEach(pTransaction => {
            if (pTransaction.txOuts[0].address === address) {
                const sysSend = (pTransaction.txIns[0].txOutId === '0' && pTransaction.txIns[0].txOutIndex === 0) ? enumSysSender.COIN_SYSTEM : '';
                const txInsSend = this.unspentTxOuts.filter(uTxOut => pTransaction.txIns[0].txOutId === uTxOut.txOutId);
                let newTx = {
                    hash: pTransaction.hash,
                    timeStamp: new Date().toString(),
                    block: -1,
                    from: '',
                    to: address,
                    amount: pTransaction.txOuts[0].amount
                };
                if (txInsSend.length > 0) {
                    newTx.from = txInsSend.address;
                } else {
                    newTx.from = sysSend;
                }
                currentTransactions.push(newTx);
            }
        })

        return currentTransactions.filter((value, index, array) => array.findIndex(element => JSON.stringify(element) === JSON.stringify(value)) === index);
    }

    getUTxOutsByAddress(address) {
        return this.unspentTxOuts.filter(uTxOut => uTxOut.address === address && uTxOut.status === 1);
    }

    getBalance(address) {
        const uTxOutsOfAddress = this.unspentTxOuts.filter(uTxOut => uTxOut.address === address && uTxOut.status === 1);
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
        block.transactions.forEach(tx => {
            tx.txOuts.forEach(txOut => {
                this.unspentTxOuts.push({...txOut});
            })
            tx.txIns.forEach(txIn => {
                this.unspentTxOuts.forEach(uTxOut => {
                    if (uTxOut.txOutId === txIn.txOutId) {
                        uTxOut.status = 0;
                    }
                })
            })
        });

    }

    parseChain(blockchain) {
        this.replaceChain(blockchain.blocks);
        this.unspentTxOuts = blockchain.unspentTxOuts;
        this.pendingTransactions = blockchain.pendingTransactions;
    }

    /////////////////////////// delete ///////////////////////////
    deleteNode(socket) {
        const index = this.nodes.findIndex(value => {
            return value.id === socket.id
        });
        this.nodes.splice(index, 1);
    }
}

class Block {
    constructor(index,
                prevHash,
                hash,
                transactions,
                timeStamp,
                difficult,
                nonce, minner = null) {
        this.index = index;
        this.transactions = transactions;
        this.timeStamp = timeStamp;
        this.prevHash = prevHash;
        this.hash = hash;
        this.difficult = difficult;
        this.nonce = nonce;
        this.minner = minner;
    }

    setMinner(address) {
        this.minner = address;
    }
}

class Transaction {
    constructor(txIns = [], txOuts = [], hash = '') {
        this.txIns = [];
        this.txOuts = [];
        this.hash = '';
    }

    parseTrasaction({txIns, txOuts, hash}) {
        this.txIns = txIns;
        this.txOuts = txOuts;
        this.hash = hash;
    }

    hashTransaction() {
        const stringTxIn = this.txIns.map(txIn => {
            return txIn.txOutId + txIn.txOutIndex
        }).reduce((a, b) => a + b, '');
        const stringTxOut = this.txOuts.map(txOut => {
            return txOut.amount.toString() + txOut.address
        }).reduce((a, b) => a + b, '');

        const hash = CryptoJS.SHA256(stringTxIn + stringTxOut).toString()
        this.hash = hash;
        return hash;
    }

    gererateTxIns(sender, amount, uTxOuts) {
        const txIns = [];

        if (systemSender.includes(sender)) {
            const index = (sender === enumSysSender.COIN_SYSTEM) ? 0 : 1;
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
        })
        return {
            txIns,
            txInBalance: currentCoin
        };
    }

    gererateTxOuts(sender, recipient, txInBalance, amount) {
        const txOuts = [];

        if (systemSender.includes(sender)) {
            const uTxOut = new UnspentTxOut({from: sender, address: recipient, amount: +amount});
            txOuts.push(uTxOut);
        } else {
            const uTxOut = new UnspentTxOut({from: sender, address: recipient, amount: +amount});
            txOuts.push(uTxOut);
            const refund = txInBalance - amount;

            if (refund > 0) {
                const uTxOutrefund = new UnspentTxOut({from: sender, address: sender, amount: refund});

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
        this.txIns.forEach(txIn => {
            txIn.signTxIn(this.hash, privateKey, unspenTxOut);
        })
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
        const refUTxOut = unspentTxOuts.filter(uTxOut => uTxOut.txOutId === this.txOutId)[0];
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
    constructor({from, address, amount}) {
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

module.exports = Blockchain;