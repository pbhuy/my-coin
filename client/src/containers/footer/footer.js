import './style.scss';

export const Footer = (props) => {
    return (
        <div className="footer">
            <div className='row'>
                <div className='footer__contents row'>
                    {
                        contents.map((item) =>{
                            return (
                                <div className='col--1--of--5'>
                                    <div className='content__title'>
                                        <h3 className='lite'>{item.title}</h3>
                                    </div>
                                    <div className='content__links'>

                                        {item.data.map((text) => {
                                            return (<div className='content'>
                                                <a href='#'><p className='text'>{text}</p></a>
                                            </div>)
                                        })
                                        }
                                    </div>
                                </div>
                            )
                        })
                    }
                <div className='col--2--of--5'>
                    <div className='content__title'>
                        <h3 className='lite'>
                            Love <i className="fa fa-heart" style={{ color: 'red', margin: '0rem 0.5rem' }} aria-hidden="true" /> MEW? Donate</h3>
                    </div>
                    <div className='content__links'>

                        <div className='content'>
                            <a href='#'><p className='text' style={{ fontSize: '1.1rem' }}>MyEtherWallet is open-source and free to the community. Your donations
                                                go a long way towards making that possible.</p></a>
                        </div>
                        <div className='content'>
                            <a href='#'>
                                <div className='text' style={{ fontSize: '1rem', color: '#05c0a5',
                                 display: 'flex', marginBottom:'1rem'}}>
                                        <span> Ethereum Donate</span>
                                </div>
                            </a>
                        </div>
                        <div className='content'>
                            <a href='#'>
                                <div className='text' style={{ fontSize: '1rem', color: '#05c0a5', display: 'flex'}}>
                                        <span> Bitcoin Donate</span>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
                </div>
                <hr style={{width:'100%', opacity: '0.5'}}/>
                <div className='footer__notes row'>  
                    <div>
                        <p>Pricing taken from </p><span>Coingecko</span>
                    </div>
                    <p>© 2023 MyEtherWallet. All Rights reserved.</p>
                </div>

            </div>

            </div>
    );
};

const discoverArray = ['Covert Units',             
                        'MEW wallet', 'MEWconnect Protocol',
                        'MEW CX', 'EthVM','Buy a Hardware wallet', 
                        'send Offline Helper', 'Verify Message', 
                        'Submit Dapp','Press Kit', 
                        'Generate Eth2 Address'];

const affiliatesArray = ['Ledger Wallet', 'Ether Card',
                        'AIchemy', 'Bity', 
                        'Billfodl', 'Finney',
                        'Trezor', 'Secalot',
                        'KeepKey', 'CoolWallet',
                        'State of the Dapps', 'BC Vault'];

const mewArray = ['About', 'Team',
                    'FAQs', 'MEWtopia',
                    'Customer Support', 'Help Center'];

const contents = [{
                title: 'Discover',
                data: discoverArray
            },{
                title: 'Affiliates',
                data: affiliatesArray
            },{
                title: 'MEW',
                data: mewArray
            }];
