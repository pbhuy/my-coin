// @flow 
import React, {useContext} from 'react';
import './style.scss';

import { createWalletContext } from '../../../../../contexts/createWalletContext';
import { NotRecommended } from '../../../../notRecommended/notRecommended';
import {CreatePassword} from './createPassword/createPassword';
import { SaveWallet } from './saveWallet/saveWallet';
export const SetupWallet = (props) => {
    const {step} = useContext(createWalletContext);

    return (
        <div className='setup-wallet'>
            <NotRecommended state={(+step === 1)? '' : 'hidden'}></NotRecommended>
            <div className='setup'>
                {
                    (()=>{
                        switch (step) {
                            case 1:
                                return <CreatePassword></CreatePassword>;

                            case 2:
                                return <SaveWallet></SaveWallet>;
                        }
                    })()
                }
            </div>
        </div>
    );
};