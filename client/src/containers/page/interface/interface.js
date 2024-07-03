// @flow 
import React, {useEffect, useContext} from 'react';
import './style.scss';
import { SlideMenu } from './slideMenu/slideMenu';
import {ContentsInterface} from './contentsInterface/contentsInterface';
import $ from 'jquery';
import { InterfaceOptionProvider } from '../../../contexts/interfaceOptionContext';

export const Interface = (props) => {
    useEffect(() => {
        document.getElementsByClassName('navbar')[0].classList.add('row-full');
    
        return () => {
            $('html,body').animate({scrollTop: 0}, 500);
            document.getElementsByClassName('navbar')[0].classList.remove('row-full');
        }
    }, []);

    return (
        <div className='interface'>

                <InterfaceOptionProvider>
                    <SlideMenu></SlideMenu>
                    <ContentsInterface></ContentsInterface>
                </InterfaceOptionProvider>
        </div>
    );
};