import './style.scss';
import {useEffect, useState, useContext } from 'react';
import { TopBanner } from '../../topBanner/topBanner';
import { About } from '../../about/about';
import { FAQs } from '../../FAQs/FAQs';

import { LogoutModal } from '../interface/contentsInterface/modalOption';
import { Modal } from '../../../components/modal/modal';
import {useLocation} from 'react-router-dom';

import $ from 'jquery';

import {authContext} from '../../../contexts/authContext';

const enumState = {
    HIDDEN: 'hidden',
    CLOSE: 'close',
    VISIBLE: 'visible'
}

export const Home = (props) => {
    const location = useLocation();
    const [modalState, setModalState] = useState(enumState.HIDDEN);
    const {resetWallet} = useContext(authContext);
    useEffect(() => {
        if (sessionStorage.getItem('auth') === 'true'){
            setModalState(enumState.VISIBLE);
        }

        if (location.hash.length > 0){
            $('html,body').animate({
                scrollTop: $(location.hash).offset().top,
            }, 500);
        }
        return () => {
             $('html,body').animate({scrollTop: 0}, 500);
        }
    }, [window.location.href]);

    return (
        <div id='#' className="home">
            
            <div className='Home__top-banner'>
                <div className='wrap'>
                    <TopBanner></TopBanner>
                </div>
            </div>
            <div id='contact' className="home__social row">
            </div>
       
            <Modal state={modalState} onClickOverlay={() => {setModalState(enumState.CLOSE); resetWallet();}}>
                    <LogoutModal closeModal={() => {setModalState(enumState.CLOSE)}}></LogoutModal>
            </Modal>
        </div>
    );
};