// @flow 
import React,{useState, useEffect} from 'react';
import './style.scss';
export const SendTransaction = (props) => {
    const [amount, setAmount] = useState(0);
    const [address, setAddress] = useState('');

    useEffect(()=>{
        setAmount(props.transaction.amount);
        setAddress(props.transaction.receive);
    },[props.transaction]);

    const handleSetupTransaction = () => {
        if (+amount === +0 || amount > props.walletBalance ){
            return;
        }
        props.setTransaction({receive: address, amount: amount});
        props.openModal();
    }

    return (
        <div className='send-transaction'>
            <div className='send-transaction__title'>
                <p>Send Transaction</p>
            </div>
            <div className='send-transaction__body'>
                <div className='send-transaction-form'>
                    <div className='amount'>
                        <div className='amount__type'>
                            <label>Type</label>
                            <p>MC <span style={{opacity: '0.5'}}>- Mew Coin</span></p>
                        </div>
                        <div className='amount__main'>
                            <label>Amount</label>
                            <input value={amount} onChange={(e) => {setAmount(e.target.value)}} type='number' placeholder='Amount'/>
                            <div className={`warning ${(+props.walletBalance >= +amount)? 'warning--hidden' : ''}`}>*Not enough MC to send.</div>
                        </div>
                    </div>
                    <div className='address'>
                            <label>Address</label>
                            <input value={address} onChange={(e) => {setAddress(e.target.value)}} type='text' placeholder='Please enter the address (0x.....)'/>
                            
                    </div>
                    <div className='tx-fee'>
                            <label>Transaction fee</label>
                            <p>Cost 0.000861000030639 MC = $0.20</p>
                    </div>
                </div>
                <div className='btn-submit'>
                    <div className='basic-button' onClick={handleSetupTransaction}>
                        Send Transaction
                    </div>
                    <p className='btn-submit__clear-btn' onClick={() => {setAddress(''); setAmount(0);}}>Clear all</p>
                </div>
            </div>
        </div>
    );
};