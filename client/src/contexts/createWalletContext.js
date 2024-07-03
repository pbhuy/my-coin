// @flow 
import React, { useState } from 'react';

export const createWalletContext = React.createContext();

export const CreateWalletProvider = (props) => {
    const [step, setStep] = useState(1);
    const [password, setPassword] = useState('');

    const setCurrentStep = (value) =>{
        setStep(value);
    }

    const setPassWallet = (value) =>{
        setPassword(value);
    }
    const exportContext = {
        step,
        setStep: setCurrentStep,
        password,
        setPassword: setPassWallet
    }

    return (
        <createWalletContext.Provider value={exportContext}>
            {props.children}
        </createWalletContext.Provider>
    );
};