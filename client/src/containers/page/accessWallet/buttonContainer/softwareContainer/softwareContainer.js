// @flow 
import React, { useState, useRef } from 'react';
import './style.scss';

const enumState = {
    VISIBLE: 'visible',
    CLOSE: 'close',
    HIDDEN: 'hidden'
}

export const SoftwareContainer = (props) => {
    const [optionSelect, setOptionSelect] = useState({ title: '', number: 0 });
    const fileInputRef = useRef();
    const handleClickOption = (e, title) => {
        const target = e.currentTarget;
        const index = +target.getAttribute('data-id');
        const walletOptions = document.getElementsByClassName('wallet-option');
        const flag = (index !== optionSelect.number) ? true : false;
        if (flag) {
            for (let item of walletOptions) {
                item.classList.remove('option-selected');
            }
            target.classList.add('option-selected');
            setOptionSelect({ title: title, number: index });
        } else {
            target.classList.remove('option-selected');
            setOptionSelect({ title: '', number: 0 });
        }
    }


    const handleSelectedFile = (e) => {
        handleModal();

        setDataKeyStore(e);
    }

    const handleModal = () => {
        props.setStateModal(enumState.CLOSE);
        setTimeout(() => {
            props.setCurrentModal({ ...optionSelect, number: 30 + parseInt(optionSelect.number) });
            props.setStateModal(enumState.VISIBLE);
        }, 100);
    }

    const handleContinueStep = () => {
        if (optionSelect.number === 1) {
            fileInputRef.current.click();
            return;
        }
        handleModal();
    }

    const setDataKeyStore = (e) => {
        var reader = new FileReader();
        reader.onload = (e) => {
            const dataFile = JSON.parse(e.target.result);
            props.setData(dataFile);
        };
        reader.readAsText(e.target.files[0]);
    }

    return (
        <div className='software-container'>
            <div className='content-container'>
                <div className='btn-option'>
                    <input ref={fileInputRef} type='file' style={{ display: 'none' }} onChange={handleSelectedFile}></input>
                    <div data-id='1' className='wallet-option' onClick={(e) => handleClickOption(e, 'Keystore File')}>
                        <div className='wallet-option__image'>
                            <img src='https://www.myetherwallet.com/img/icon-keystore-file.956cbf72.svg'></img>
                        </div>
                        <p className='wallet-option__name'>Keystore File</p>
                        <i className="fa fa-check-circle fa-2x wallet-option__icon" aria-hidden="true"></i>
                    </div>

                    <div data-id='2' className='wallet-option' onClick={(e) => handleClickOption(e, 'Private key')}>
                        <div className='wallet-option__image'>
                            <img src='data:image/png;base64,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'></img>
                        </div>
                        <p className='wallet-option__name'>Private key</p>
                        <i className="fa fa-check-circle fa-2x wallet-option__icon" aria-hidden="true"></i>
                    </div>
                </div>
                <div className='software-link'>
                    <p>Purchase a hardware wallet for the highest security when accessing your crypto.</p>
                    <p className='software-link__link'>Purchase a hardware wallet</p>
                </div>
            </div>
            <div className='basic-button button--icon-hidden' onClick={handleContinueStep}>Continue</div>
            <div className='support'>
                <h5 className='support__label'>Customer Support</h5>
            </div>

        </div>
    );
};