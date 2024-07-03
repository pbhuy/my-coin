// @flow 
import CryptoJS from 'crypto-js';
import EC from 'elliptic';

import React, {useState, useContext, useEffect} from 'react';
import {useHistory} from 'react-router-dom';
import './style.scss';
import { Modal } from '../../../../../../components/modal/modal';
import { createWalletContext } from '../../../../../../contexts/createWalletContext';
const enumState = {
    VISIBLE: 'visible',
    CLOSE: 'close',
    HIDDEN: 'hidden'
}
const ec = new EC.ec('secp256k1');

export const SaveWallet = (props) => {
    const {password} = useContext(createWalletContext);
    const history = useHistory();
    const [stateModal, setStateModal] = useState(enumState.HIDDEN);
    const [active, setActive] = useState(false);
    useEffect(() => {
        setTimeout(() => {
            setActive(true);
        }, 5000);
    }, [])
    const handleDowloadFile = () => {
        if (!active) return; 
        setStateModal(enumState.VISIBLE);
        dowloadKeystore();
    }

    const handleRedirect = () => {
        document.body.style = 'overflow-y: auto';
        history.push('/access-wallet');
    }

    const encryptPK = (privateKey, secretKey) => {
        const key = CryptoJS.enc.Hex.parse(secretKey.substring(8,40)).toString();
        var encrypted = CryptoJS.AES.encrypt(privateKey, key).toString();
        console.log(privateKey);
        //console.log(decryptPK(encrypted, secretKey));
        
        return encrypted;
    }

    const dowloadKeystore = () => {
       
        const fileName = `keystore-wallet-${Date.now()}.json`;
        const passHash = CryptoJS.SHA256(password).toString();
        const Key = ec.genKeyPair();
        const data = {
            address: Key.getPublic('hex'),
            password: passHash,
            crypt: encryptPK(Key.getPrivate('hex'), passHash)
        }
        var blob = new Blob([JSON.stringify(data)], {type: "text/plain"});
        var url = window.URL.createObjectURL(blob);
        var dowloadTag = document.createElement("a");
        dowloadTag.href = url;
        dowloadTag.download = fileName;
        dowloadTag.click();
    }

    return (
        <>
            <h2 className='title'>Save My Keystore File</h2>
            <Modal state={stateModal} onClickOverlay={(e) => {
                        setStateModal(enumState.CLOSE);
                }}>
                    <div className='modal-block'>
                        <div className='status-modal'>
                            <i className='fa fa-check fa-5x status-modal__icon ' aria-hidden='true'></i>
                            <p className='status-modal__title'>Success</p>
                            <h5 className='status-modal__desc'>You have created your wallet successfully.</h5>
                        </div>
                    
                    <div className='basic-button button--icon-hidden' onClick={handleRedirect}>
                            Access My Wallet
                                <i className="fa fa-arrow-right basic-button__icon" aria-hidden="true"></i>
                        </div>
                    </div>
            </Modal>
            <div className='save-wallet-content'>
                {
                    contentBlocks.map((item, index) => {
                        return (
                            <div className='save-wallet-content__block'>
                                <div className='text-block'>
                                    <p className='text-block__title'>{item.title}</p>
                                    <h5 className='text-block__desc'>{item.desc}</h5>
                                </div>
                            </div>
                        );
                    })
                }
                <div className={`basic-button ${(active)? 'button--icon-hidden' : 'button--disabled'}`} onClick={handleDowloadFile}>
                    Download Keystore File
                    <i className="fa fa-spinner fa-pulse fa-fw basic-button__icon" aria-hidden="true"></i>
                </div>
            </div>

            
        </>
    );
};

const contentBlocks = [
    {srcImg: 'https://www.myetherwallet.com/img/no-lose.ef5e7643.svg', title: 'Don\'t Lose It', desc: 'Be careful, it can not be recovered if you lose it.'},
    {srcImg: 'https://www.myetherwallet.com/img/no-share.295ef578.svg', title: 'Don\'t Share It', desc: 'Your funds will be stolen if you use this file on a malicious phishing site.'},
    {srcImg: 'https://www.myetherwallet.com/img/make-a-backup.e461a34b.svg', title: 'Make a Backup', desc: 'Secure it like the millions of dollars it may one day be worth.'}
]