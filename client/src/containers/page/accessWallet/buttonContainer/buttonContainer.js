// @flow 
import CryptoJS from 'crypto-js';
import EC from 'elliptic';

import React, { useState,useContext } from 'react';
import { useHistory } from 'react-router-dom';
import './style.scss'

import { Modal } from '../../../../components/modal/modal';
import { Input } from '../../../../components/input/input';

import { NotRecommended } from '../../../notRecommended/notRecommended';

import { SoftwareContainer } from './softwareContainer/softwareContainer';

import { authContext } from '../../../../contexts/authContext';

const ec = new EC.ec('secp256k1');
const enumState = {
    VISIBLE: 'visible',
    CLOSE: 'close',
    HIDDEN: 'hidden'
}

export const ButtonContainer = (props) => {
    const {setAuth, setMyWallet} = useContext(authContext);
    const history = useHistory();
    const [stateModal, setStateModal] = useState(enumState.HIDDEN);
    const [accessWalletText, setAccessWalletText] = useState('');
    const [data, setData] = useState({});
    const [currentModal, setCurrentModal] = useState({title: '',number: 0});
   
    const handleBtnClick = (e, title) => {
        const index = +e.currentTarget.getAttribute('data-id')
        setCurrentModal({title: title, number: index});
        setStateModal(enumState.VISIBLE);
    }

    const handleAccessWallet = () => {
        switch (currentModal.number) {
            case 31:
                if(accessWalletText.length < 9){
                    return;
                }else {
                    if(!handlePassword()) return;
                }
                break;
            case 32:
                if (accessWalletText.length < 34){
                    return;
                }else {
                    handlePrivateKey();
                }
                break;
            default:
                break;
        }

        setStateModal(enumState.CLOSE);
        setTimeout(()=>{
            history.push('/interface');
        },200);
    }

    const decryptPK = (encrypted, secretKey) => {
        const key = CryptoJS.enc.Hex.parse(secretKey.substring(8,40)).toString();
        const decrypt =  CryptoJS.AES.decrypt(encrypted, key).toString(CryptoJS.enc.Utf8);
        return decrypt;
    }

    const handlePassword = () => {
        const hashCurrentPassword = CryptoJS.SHA256(accessWalletText).toString();
        if (hashCurrentPassword !== data.password){
            return false;
        }
        setAuth(true);
        const publicKey = `0x${data.address}`;
        const privateKey = `0x${decryptPK(data.crypt, hashCurrentPassword)}`;
        setMyWallet({publicKey, privateKey});
        return true;
    }   

    const handlePrivateKey =() => {
        const keyPair = ec.keyFromPrivate(accessWalletText.substring(2,accessWalletText.length));
        
        const publicKey = `0x${keyPair.getPublic('hex')}`;
        const privateKey = `0x${keyPair.getPrivate('hex')}`;
        setMyWallet({publicKey, privateKey});
        setAuth(true);
    }

    return (
        <div className='button-container row'>
            {
                btnData.map((item, index) => {
                    return (
                        <div data-id={index + 1} className={`btn-block ${item.style}`} onClick={(e)=>handleBtnClick(e, item.title)} >
                            <h3 className='btn-block__title'>{item.title}</h3>
                            <p className='btn-block__desc'>{item.desc}</p>
                            <p className='btn-block__sub-note'>{item.subNote}</p>
                        </div>
                    )
                })
            }
            <Modal state={stateModal} onClickOverlay={(e) => {setStateModal(enumState.CLOSE); }}>
                <div className='modal-block'>
                    <div className='header'>
                        <p className='header__title'>Access By {currentModal.title}</p> 
                        <i className="fa fa-times fa-2x header__icon" aria-hidden="true" onClick={() => {setStateModal(enumState.CLOSE)}}></i>
                    </div>
                    <div className='modal-block__content'>
                        <NotRecommended></NotRecommended>
                        <div className='content'>
                            {
                                (() => {
                                    switch (currentModal.number) {
                                        case 1:
                                            return <SoftwareContainer setData={setData} setCurrentModal={setCurrentModal} setStateModal={setStateModal}></SoftwareContainer>;
                                        
                                        case 31:
                                            return (
                                                <div className='wallet-option-next'>
                                                    <Input onChangeText={(e) => {setAccessWalletText(e.target.value)}} placeHolder='Enter password' type='password'></Input>
                                                    <div className={`basic-button ${(accessWalletText.length < 9)? 'button--disabled' : ''}`} onClick={handleAccessWallet}>Accesss Wallet</div>
                                                    <div className='support'>
                                                        <h5 className='support__label'>Customer Support</h5>
                                                    </div>
                                                </div>
                                            );
                                        case 32:
                                            return (
                                                <div className='wallet-option-next'>
                                                    <Input onChangeText={(e) => {setAccessWalletText(e.target.value)}} placeHolder='Enter private key' type='text' ></Input>
                                                    <div className={`basic-button ${(accessWalletText.length < 34)? 'button--disabled' : ''}`} 
                                                        onClick={handleAccessWallet}>Accesss Wallet</div>
                                                    <div className='support'>
                                                        <h5 className='support__label'>Customer Support</h5>
                                                    </div>
                                                </div>
                                            );;

                                        default:
                                            return <></>;
                                    }
                                })()
                            }
                        </div>
                    </div>
                </div>

            </Modal>
        </div>
    );
};


const btnData = [
    { srcImg: 'https://www.myetherwallet.com/img/button-software.2a233dbf.svg', style: 'btn-success', title: 'Software', desc: ' Keystore file, Private key, Mnemonic phrase ', subNote: '' }
];