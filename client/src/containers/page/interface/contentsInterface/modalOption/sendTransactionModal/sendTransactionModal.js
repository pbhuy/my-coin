// @flow
import React, { useContext, useState } from 'react';
import './style.scss';
import { authContext } from '../../../../../../contexts/authContext';
import numeral from 'numeral';
import axios from '../../../../../../core/api';

const enumState = {
  HIDDEN: 'hidden',
  CLOSE: 'close',
  VISIBLE: 'visible',
};

export const SendTransactionModal = (props) => {
  const { transaction, blockchain } = props;
  const { myWallet } = useContext(authContext);

  const [step, setStep] = useState(1);
  const [send, setSend] = useState(false);

  const handleSendTransaction = () => {
    setSend(true);
    const priKey = myWallet.privateKey.substring(2, myWallet.privateKey.length);
    const pubKey = myWallet.publicKey.substring(2, myWallet.publicKey.length);
    const receive = transaction.receive.substring(2, transaction.receive.length);

    const newTx = blockchain.generateTransaction(pubKey, receive, transaction.amount, priKey);

    axios.post('/transactions', newTx).then((res) => {
      props.setupModal(enumState.CLOSE);
      setTimeout(() => {
        props.setupModal(enumState.VISIBLE);
        setStep(2);
      }, 200);
    });
  };

  const handleFinishConfirm = () => {
    props.setupModal(enumState.CLOSE);
    props.setTransaction({ receive: '', amount: 0 });
    setTimeout(() => {
      setStep(1);
      setSend(false);
    }, 500);
  };

  return (
    <div className='send-transaction-modal'>
      <div className={`confirm ${step === 1 ? '' : 'confirm--hidden'}`}>
        <div className='confirm__header'>Confirm Your Transaction</div>
        <hr></hr>
        <div className='content'>
          <div className='transaction'>
            <div className='transaction-item'>
              <p className='transaction-item__header'>Your</p>
              <p className='transaction-item__body'>{myWallet.publicKey}</p>
            </div>
            <div className='transaction-icon'>
              <i class='fa fa-angle-double-right fa-3x transaction-icon__icon-1' aria-hidden='true'></i>
              <i class='fa fa-angle-double-right fa-3x transaction-icon__icon-2' aria-hidden='true'></i>
              <i class='fa fa-angle-double-right fa-3x transaction-icon__icon-3' aria-hidden='true'></i>
            </div>
            <div className='transaction-item item--target'>
              <p className='transaction-item__header'>Destination</p>
              <p className='transaction-item__body'>{transaction.receive}</p>
            </div>
          </div>
          <div className='content__amount'>
            Amount: <span className='txt--main'>MC</span>
            <span className='txt--warning'>{numeral(transaction.amount).format('0,0')}</span>
          </div>
          <div className='content__fee'>
            Transaction fee: <span className='txt-right'>0.20 $</span>
          </div>
        </div>
        <div className='bottom'>
          <p className='confirm__notice'>*Please check your transaction again.</p>
          <div className='confirm__btn' onClick={handleSendTransaction}>
            {send ? <i class='fa fa-spinner fa-pulse fa-fw'></i> : 'Send'}
          </div>
        </div>
      </div>
      <div className={`notice ${step === 2 ? '' : 'notice--hidden'}`}>
        <div className='modal-block'>
          <div className='status-modal'>
            <i className='fa fa-check fa-5x status-modal__icon ' aria-hidden='true'></i>
            <p className='status-modal__title'>Success</p>
            <h5 className='status-modal__desc'>You have sent your transaction successfully.</h5>
          </div>

          <div className='basic-button button--icon-hidden' onClick={handleFinishConfirm}>
            Continue
            <i className='fa fa-arrow-right basic-button__icon' aria-hidden='true'></i>
          </div>
        </div>
      </div>
    </div>
  );
};
