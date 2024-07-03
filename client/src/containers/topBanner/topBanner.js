// @flow 
import React from 'react';
import { Intro } from './intro/intro';
import { Wallet } from './wallet/wallet';

export const TopBanner = (props) => {
    return (
        <>
            <Intro></Intro>
            <Wallet></Wallet>
        </>
    );
};