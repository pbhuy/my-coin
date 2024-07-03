// @flow 
import React,{useContext} from 'react';
import './style.scss';
import { SetupWallet } from './setupWallet/setupWallet';

import { createWalletContext } from '../../../../contexts/createWalletContext';
export const Content = (props) => {
    const {step} = useContext(createWalletContext);
    
    return (
        <div className='content'>
            <div className={`content__period ${(+step === 2)? 'period--70' : ''}`}>
                By keystore File
            </div>
            <div className='content__main'>
                    <SetupWallet></SetupWallet>
            </div>
        </div>
    );
};