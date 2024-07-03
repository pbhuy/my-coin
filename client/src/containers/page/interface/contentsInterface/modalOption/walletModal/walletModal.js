// @flow 
import React, {useContext} from 'react';
import './style.scss';
import { authContext } from '../../../../../../contexts/authContext';

export const WalletModal = (props) => {
    const {myWallet} = useContext(authContext);
    return (
        <div className='wallet-modal'>
            <div className='wallet-modal__header'>
                <p className='wallet-modal__header-title'>Detail Infomation</p>
                <i className="fa fa-times fa-2x wallet-modal__header-icon" aria-hidden="true" onClick={() => {props.closeModal()}}></i>
            </div>

            <div className='wallet-modal__body'>
                <div className='info-item item--info'>
                    <p className='info-item__title'>My Address</p>
                    <p className='info-item__content'>{myWallet.publicKey}</p>
                </div>
                <div className='info-item item--warning'>
                    <p className='info-item__title'>Private key</p>
                    <p className='info-item__content'>{myWallet.privateKey}</p>
                </div>
            </div>

        </div>
    );
};