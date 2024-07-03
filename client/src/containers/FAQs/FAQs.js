import './style.scss';
import React from 'react';
import { Expander } from '../../components/expander/expander';

export const FAQs = (props) => {
    return (
        <>
                <div className='FAQs row'>
                    <div className='FAQs__header'>
                        <div className='FAQs__title'>
                            <p>FAQs</p>
                            <h5>Have not found the question that you are looking for? <span>see more...</span></h5>
                        </div>
                        <div className='support'>
                            <h5 className='label'>Customer Support</h5>
                        </div>
                    </div>
                    <div className='FAQs__content'>
                        <ul>
                            {
                                faqsData.map((item) => {
                                    return (
                                        <li><Expander question={item.quesiton} answer={item.answer}></Expander></li>
                                    )
                                })
                            }

                        </ul>
                    </div>
                </div>
        </>
    );
};

const faqsData = [
    {quesiton: 'What is MEW Wallet?', answer: 'MEW wallet is our official fully-fledged mobile app, bringing Ethereum to your iOS or Android phone.'},
    {quesiton: 'Can MEW work with other Wallets?', answer: 'MEW supports many different wallet types including hardware wallets, such as the Ledger Nano S or Trezor, and third-party wallets like MetaMask. We are also open for anyone to use their Ethereum wallets with the appropriate information.'},
    {quesiton: 'How can i send a transaction', answer: 'MEW lets anyone with a balance of ETH or ERC20 tokens send a transaction, without additional charges. Using the Ethereum blockchain takes gas, which is paid for in ETH, so we recommend having at least .01 ETH to cover around 2 - 3 transactions.'},
    {quesiton: 'I forgot my password/Private key! What can i do?', answer: 'MEW does not offer support to recover or reset passwords/private keys. We always suggest writing down private keys and passwords on physical paper/notebooks for safekeeping. Maybe you saved it on your computer!'},
    {quesiton: 'How do i create a new wallet', answer: 'MyEtherWallet (MEW) offers three ways to create a new ETH wallet. These are via MEW wallet, Keystore file, or Mnemonic phrase.'}
    ]