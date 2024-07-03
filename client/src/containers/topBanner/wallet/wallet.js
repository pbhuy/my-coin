// @flow 
import React from 'react';
import './style.scss';
import { Button } from '../../../components/button/button';
import {Link} from 'react-router-dom';
export const Wallet = (props) => {
    return (
        <>
          <div className="wallet row">
                {
                    btnData.map((item) =>{
                        return (
                            <Link to={item.route} style={{textDecoration: 'none', width: '49%'}}>
                                <Button
                                    className={item.className}
                                    title={item.title}
                                    description={item.description}
                                    srcIcon={item.srcIcon}
                                    direct={item.direct}
                                    subDesc={item.subDesc || [] }
                                ></Button>
                            </Link>
                        )
                    })
                }
            </div>  
        </>
    );
};

const btnData = [
    {
        route: '/create-wallet/',
        className: 'btn--blue', 
        title: 'Create A new Wallet', 
        description: 'Generate your own unique Ethereum wallet. Receive a public address (0x...) and choose a method for access and recovery.', 
        direct: 'Get Started', 
        srcIcon: 'https://icons8.com/icon/E7kXDlAgCj90/wallet'},
    {
        route: '/access-wallet/',
        className: 'btn--main', 
        title: 'Access My Wallet', 
        description: 'Connect to the blockchain using the wallet of your choice.', 
        subDesc: [
            'Send and Swap ETH & Tokens',
            'Sign & Verify Messages',
            'Interact with Contracts, ENS, Dapps, and more!'],
        direct: 'Access Now', 
        srcIcon: 'https://www.myetherwallet.com/img/unlock-wallet.3f0ec389.png'}
]