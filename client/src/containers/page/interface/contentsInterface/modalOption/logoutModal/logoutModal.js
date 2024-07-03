// @flow 
import React, { useContext } from 'react';
import {useHistory} from 'react-router-dom';

import './style.scss';
import { authContext } from '../../../../../../contexts/authContext';

export const LogoutModal = (props) => {
    const history = useHistory();
    const { resetWallet, loadKey } = useContext(authContext);

    const handleRedirect = () => {
        props.closeModal();
        loadKey(); 
        setTimeout(()=> {
            history.push('/interface')
        },200);
    }

    const handleLogout = () => {
        resetWallet();
        props.closeModal();
    }
    return (
        <div className='logout-modal'>
            <p className='logout-modal__title'>Are you sure you want to logout of your wallet?</p>
            <div className='buttons'>
                <div className='buttons__item btn--outline' onClick={handleRedirect}>No</div>
                <div className='buttons__item' onClick={handleLogout}>Yes</div>
            </div>
        </div>
    );
}