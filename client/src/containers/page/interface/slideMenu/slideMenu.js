// @flow 
import React, {useContext, useEffect} from 'react';
import './style.scss';

import { interfaceOptionContext } from '../../../../contexts/interfaceOptionContext';

export const SlideMenu = (props) => {
    const {option, setInterfaceOption} = useContext(interfaceOptionContext);

    const handleInterfaceOption = (e) => {
        const target = e.currentTarget;
        setInterfaceOption(+target.getAttribute('data-id')+1);
    }

    return (
        <div className='slide-menu'>
            {
                menuItems.map((item,index)=>{
                    return (
                        <div 
                            onClick={handleInterfaceOption}
                            data-id={index} 
                            className={`menu-item ${(+option === index+1)? 'item--active': '' }`}>
                            <div className='menu-item__image'>
                                <img src={item.srcImg}></img>
                            </div>
                            <p className='menu-item__text'>{item.text}</p>
                        </div>
                    );
                })
            }
        </div>
    );
};

const menuItems = [
    {srcImg: '/dashboard.png', text: 'Dashboard' },
    {srcImg: '/send.png', text: 'Send'},
    {srcImg: '/mine.png', text: 'Mining' },
    {srcImg: '/history.png', text: 'History' },
    {srcImg: '/history.png', text: 'History Logs' }
];  