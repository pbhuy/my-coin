// @flow 
import React, {useContext, useState, useEffect} from 'react';
import './style.scss';
import {ButtonContainer} from './buttonContainer/buttonContainer';
import { FAQs } from '../../FAQs/FAQs';
import { Link } from 'react-router-dom';

import { Modal } from '../../../components/modal/modal';
import {LogoutModal} from '../interface/contentsInterface/modalOption';

import { authContext } from '../../../contexts/authContext';

import $  from 'jquery';

const enumState = {
    HIDDEN: 'hidden',
    CLOSE: 'close',
    VISIBLE: 'visible'
}

export const AccessWallet = (props) => {
    const [modalState, setModalState] = useState(enumState.HIDDEN);
    const {resetWallet} = useContext(authContext);
    useEffect(() => {
        if (sessionStorage.getItem('auth')=== 'true'){
            setModalState(enumState.VISIBLE);
        }
        return () => {
            $('html,body').animate({scrollTop: 0}, 500);
        }
    }, []);
    return (
        <div className='access-wallet'>
            <div className='page-container'>
                <div className='wrap'>
                    <div className='header'>
                        <h2>Access My Wallet</h2>
                        <p>Do not have a wallet? <Link className='header__link'>Create A New Wallet</Link></p>
                    </div>
                    <div className='access-wallet__content'>
                        
                            <ButtonContainer></ButtonContainer>
                        
                    </div>
                </div>
            </div>
            <div className='bottom'>
                <div className='wrap'>
                    <FAQs></FAQs>
                </div>
            </div>
            <Modal state={modalState} onClickOverlay={() => {setModalState(enumState.CLOSE); resetWallet();}}>
                <LogoutModal closeModal={() => {setModalState(enumState.CLOSE)}}></LogoutModal>
            </Modal>
        </div>
    );
};