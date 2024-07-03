// @flow 
import React from 'react';
import './style.scss';
export const TopSection = (props) => {
    return (
        <>
            <div className="top-section">
                <div className='row'>
                    <div className='text'>
                        <div className='text__title'>
                            <p>About MEW</p>
                        </div>
                        <div className='text__description'>
                            MyEtherWallet - please, call us MEW - puts the Ethereum blockchain at your fingertips. We are a team of crypto-enthusiasts dedicated to bring you the most secure, most intuitive, and dare we say prettiest way to manage your ETH and ERC20 tokens. We're always here to help, and we're never giving away ETH. Cheers!
                                </div>
                    </div>
                    <div className='top-section__image'>
                        <img src='https://www.myetherwallet.com/img/mew-icon.de3130df.png'></img>
                    </div>
                </div>
            </div>
        </>
    );
};