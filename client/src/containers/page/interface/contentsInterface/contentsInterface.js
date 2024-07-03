// @flow
import React, { useContext, useState, useEffect } from 'react';
import './style.scss';

import { useHistory, useLocation } from 'react-router-dom';

import socketEvt from '../../../../core/sockEvt';
import Blockchain from '../../../../core/blockchain';
import io from 'socket.io-client';
import { Modal } from '../../../../components/modal/modal';
import { Dashboard, SendTransaction, HistoryTransaction } from './interfaceOptions';

import { interfaceOptionContext } from '../../../../contexts/interfaceOptionContext';
import { authContext } from '../../../../contexts/authContext';

import { WalletModal, LogoutModal, SendTransactionModal } from './modalOption';
import { HistoryLog } from './interfaceOptions/historyTransactionBlock/HistoryLog';
import { PendingTransaction } from './interfaceOptions/pendingTransaction/PendingTransaction';

const enumState = {
  HIDDEN: 'hidden',
  CLOSE: 'close',
  VISIBLE: 'visible',
};

const enumOptionModal = {
  WALLET: 'wallet',
  LOGOUT: 'logout',
  SEND: 'sendTx',
};

const enumOptionMine = {
  SUCCESS: { state: 'success', classIcon: 'fa-check', text: 'Success' },
  FAIL: { state: 'fail', classIcon: 'fa-exclamation-triangle', text: 'Fail' },
  MINING: { state: 'mining', classIcon: 'fa-spinner fa-pulse', text: 'Mining' },
  HIDDEN: { state: 'hidden', classIcon: '', text: '' },
};

let socket, blockchain;
const server = 'http://localhost:4000';
export const ContentsInterface = (props) => {
  const history = useHistory();

  const { option } = useContext(interfaceOptionContext);
  const { loadKey, myWallet } = useContext(authContext);

  const [modalState, setModalState] = useState(enumState.HIDDEN);
  const [balance, setBalance] = useState(0);
  const [lastBlockIndex, setLastBlockIndex] = useState(1);
  const [pendingTx, setPendingTx] = useState(0);
  const [stateMine, setStateMine] = useState(enumOptionMine.HIDDEN);
  const [newTx, setNewTx] = useState({ receive: '', amount: 0 });

  const [optionModal, setOptionModal] = useState(enumOptionModal.WALLET);

  useEffect(() => {
    if (!(sessionStorage.getItem('auth') === 'true')) {
      history.push('/access-wallet');
    } else {
      loadKey();
    }
    socket = io(server);
    blockchain = new Blockchain(socket);

    socket.on(socketEvt.ADD_TRANSACTION, (transaction) => {
      blockchain.addTransaction(transaction);
      setPendingTx(blockchain.getPendingTransactions().length);
    });

    return () => {
      socket.disconnect();
      socket.off();
    };
  }, []);

  function mineNewBlock(transactions, index, timeStamp, prevHash) {
    console.log(transactions);
    setStateMine(enumOptionMine.MINING);
    blockchain.setMine(true);
    transactions.push(blockchain.addTransactionReward(myWallet.publicKey.substring(2, myWallet.publicKey.length)));
    const newblock = blockchain.proofOfWork(index, transactions, timeStamp, prevHash, 0);
    newblock.then(async (result) => {
      if (result !== null) {
        result.setMinner(myWallet.publicKey.substring(2, myWallet.publicKey.length));
        console.log(JSON.stringify(result) + 'aj');
        await blockchain.addBlock(result);
        setStateMine(enumOptionMine.SUCCESS);
        console.log(JSON.stringify(result) + 'ajaj');

        setPendingTx(blockchain.getPendingTransactions().length);
        setBalance(blockchain.getBalance(myWallet.publicKey.substring(2, myWallet.publicKey.length)));
        setLastBlockIndex(blockchain.getLastBlock().index);
        socket.emit(socketEvt.BROADCAST_ENDMINING, { result: JSON.stringify(result) });
        setTimeout(() => {
          setStateMine(enumOptionMine.HIDDEN);
        }, 3000);
      }
    });
  }

  useEffect(() => {
    if (myWallet.publicKey !== '') {
      socket.on(socketEvt.ADD_NODE, (mainChain) => {
        blockchain.parseChain(mainChain);
        setBalance(blockchain.getBalance(myWallet.publicKey.substring(2, myWallet.publicKey.length)));
        setPendingTx(blockchain.getPendingTransactions().length);
        setLastBlockIndex(blockchain.getLastBlock().index);
      });
      socket.on(socketEvt.START_MINING, async ({ index, transactions, timeStamp, prevHash }) => {
        mineNewBlock(transactions, index, timeStamp, prevHash);
      });
      socket.on(socketEvt.END_MINING, async (newBlock) => {
        blockchain.setMine(false);
        await blockchain.addBlock(newBlock);
        setStateMine(enumOptionMine.FAIL);

        setPendingTx(blockchain.getPendingTransactions().length);
        setBalance(blockchain.getBalance(myWallet.publicKey.substring(2, myWallet.publicKey.length)));
        setLastBlockIndex(blockchain.getLastBlock().index);

        setTimeout(() => {
          setStateMine(enumOptionMine.HIDDEN);
        }, 3000);
      });
    }
  }, [myWallet.publicKey]);

  const setupModal = (state = enumState.CLOSE, option = optionModal) => {
    setModalState(state);
    setOptionModal(option);
  };

  const handleClickBtnInfo = () => {
    setupModal(enumState.VISIBLE, enumOptionModal.WALLET);
  };

  return (
    <div className='contents-interface'>
      <Modal
        state={modalState}
        onClickOverlay={() => {
          setModalState(enumState.CLOSE);
        }}
      >
        {(() => {
          switch (optionModal) {
            case enumOptionModal.WALLET:
              return (
                <WalletModal
                  closeModal={() => {
                    setupModal();
                  }}
                ></WalletModal>
              );
            case enumOptionModal.LOGOUT:
              return (
                <LogoutModal
                  closeModal={() => {
                    setupModal();
                  }}
                ></LogoutModal>
              );
            case enumOptionModal.SEND:
              return (
                <SendTransactionModal
                  setTransaction={setNewTx}
                  blockchain={blockchain}
                  transaction={newTx}
                  setupModal={setupModal}
                ></SendTransactionModal>
              );
            default:
              break;
          }
        })()}
      </Modal>
      <div className='top-content'>
        <div className='content-item item--color-main'>
          <div
            className='content-item__image'
            style={{
              backgroundImage: `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAADx0lEQVR4Xu3dsXFUMRSFYTl3SiukFECIC6ABInfhlCo8Y0IKIKUHKqAIExPu+zVzR7MfMfdJe/Tr6EirfX54fnx5X4P/Pj59Sa3/fvuR6mvx6f1/AEBDAABNv3W6gKf3nwPcOcAAAIAQWBiwBBT11pIBhncxloA7BxgAAJABCgMyQFFPBljTJ5mWgDsHGAAAkAEKAzJAUU8GkAFOn0Gn9//h9euf0fsA0yk4GlgurwDVDgCgKhjrATB8Fh7HL5cDAAAZovIAS0BRb0MtB+AAGzC6/ggOcF27LZUcgANsAenqQzjAVeU21XEADrAJpWuP4QDXdNtWxQE4wDaYrjyIA1xRbWMNB+AAG3G6/VEc4HbNtlZwAA6wFahbH5bvBH7+dWuT////v9/b+wE+fJt9P8B0/39+avoDoOm3AMABEkLVwTiAJSABaAlI8i1LgBA4G2ItAZaA5GGWgCSfJWBZAiwBaQ5N76NT5xcH4ADDJ5lCoBCYTEwITPJZAiwBloA2hYTA9m2mDCADpBmYbwRN/76/nkMk9dZadQbW9uuNIgDEEQDA8JUuDtBOIjkAB2jvCJIBIkGxXAaIV9Ki/kIgB6gItXoOwAESQUJgks85wPirTm0DbQPjHG7lDoIcBDWCYrUQKAQmhITAJJ8QKATGX+dG/vLfXeQAcQSEwBgCa4iZPomc7n9tf9wB6gcAwOHnAABodwKrfhwgZoA6ANXBavsAAMDshZBKcJ1BcfzzNqz2v+rHASIBdQAA8NRSbBUwjj8HqAMwPYMAEP9wJABmHaxOIBkgWkAdgOkJBAAA2AYWBjiAL4MKP/nr9AqgJSAN37INnA4xtf04/ucD8Pz48l5EqBZUB/D0a+HT+uWXRE1/AAC0r5MBUOxvwxtCpicQAAAgAxQG6qVQDhDPEWQAGaBM4FzLAYa/z+cAHCDP4vIADsABCj/jJ4m2gWn4+o9D7QLsAhKC9SidAyT5OcD4GmYXYBcQ53ArtwuwC0gE3X0ITOopzlfKxkOgMWwKHL8LaB9fNQDunAEAACApIAMk+eaLOcD8GIz2AACj8s83DoD5MRjtAQBG5Z9vHADzYzDaAwCMyj/fOADmx2C0BwAYlX++cQDMj8FoDwAwKv984xmA1+HXxFUJT78SVj9/vVAy/oqYKgAA2nsKARAJrHcCY/P5Ui4A4ggAIP6wI+q/LAGWgMpQqucAHCABVIvtAvzp2MSQEJjk678NjM3bBQiBQmCdRKleCBQCE0C1WAgUAhNDQmCSTwjMv06N+jsJjD/P5wCRwNND4D8Byyv9ACQ3RgAAAABJRU5ErkJggg==')`,
            }}
          >
            <img src=''></img>
          </div>
          <div className='content-item__main'>
            <div className='text'>
              <p className='text__title'>Address</p>
              <p className='text__desc'>{myWallet.publicKey}</p>
            </div>
            <div className='content-item__subIcon' onClick={handleClickBtnInfo}>
              <img src='/more.png'></img>
            </div>
          </div>
        </div>

        <div className='content-item item--border-none item--color-submain'>
          <div className='content-item__image'>
            <img src='/wallet.png'></img>
          </div>
          <div className='content-item__main'>
            <div className='text text--large'>
              <p className='text__title'>Balance</p>
              <p className='text__desc'>
                <span>{balance}</span> MC
              </p>
            </div>

            <div className={`subTab subTab--${stateMine.state}`}>
              <i className={`subTab__icon fa ${stateMine.classIcon} fa-2x fa-fw`}></i>
              <p className='subTab__text'>{stateMine.text}</p>
            </div>
          </div>
        </div>

        <div className='content-item'>
          <div className='content-item__image'>
            <img src='/ethereum.png'></img>
          </div>
          <div className='content-item__main'>
            <div className='text'>
              <p className='text__title'>Network</p>
              <p className='text__desc'>Last block# : {lastBlockIndex}</p>
            </div>
            <div className='pending-tx'>
              <i className='fa fa-exchange fa-3x' aria-hidden='true'></i>
              <div className='pending-tx__count'>{pendingTx}</div>
            </div>
          </div>
        </div>
      </div>
      <div className='interface-option'>
        {(() => {
          switch (option) {
            case 1:
              return <Dashboard></Dashboard>;

            case 2:
              return (
                <SendTransaction
                  transaction={newTx}
                  setTransaction={setNewTx}
                  walletBalance={balance}
                  openModal={() => {
                    setupModal(enumState.VISIBLE, enumOptionModal.SEND);
                  }}
                ></SendTransaction>
              );
            case 3:
              return (
                <PendingTransaction
                  pendingTxs={blockchain.getPendingTransactionsOutput()}
                  pendingTx={pendingTx}
                  onMining={() => {
                    mineNewBlock(
                      blockchain.getPendingTransactions(),
                      blockchain.getLastBlock().index + 1,
                      new Date().toString(),
                      blockchain.getLastBlock().hash
                    );
                  }}
                />
              );

            case 4:
              return <HistoryTransaction stateMine={stateMine} pendingTx={pendingTx}></HistoryTransaction>;
            case 5:
              return <HistoryLog />;
            default:
              break;
          }
        })()}
      </div>
    </div>
  );
};
