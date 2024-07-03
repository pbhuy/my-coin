// @flow 
import * as React from 'react';
import './style.scss';
import { BottomSection } from './bottomSection/bottomSection';
import { TopSection } from './topSection/topSection';
export const About = (props) => {
    return (
        <>
                <div className='fix-clip'>
                    <div className='clip-path'></div>
                </div>
                <div className='content'>
                        <TopSection></TopSection>
                    <div className='wrap'>
                        <BottomSection></BottomSection>
                    </div>                    
                </div>  
        </>
    );
};