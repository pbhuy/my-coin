// @flow 
import React from 'react';
import './style.scss';


export const Intro = (props) => {
    return (
        <>
            <div className="intro row">
                <div className='text'>
                    <div className='text__title'>
                        <p>Ethereum's <br /> Original Wallet</p>
                    </div>
                    <div className='text__description'>
                        MyEtherWallet (our friends call us MEW) is a free, client-side interface helping you interact with the Ethereum blockchain. Our easy-to-use, open-source platform allows you to generate wallets, interact with smart contracts, and so much more.
                    </div>
                </div>
                <div className='intro__image'>
                    <img src='https://www.myetherwallet.com/img/bg-home-spaceman-and-dog.313ea5b0.svg'></img>
                </div>
            </div>

        </>
    );
};