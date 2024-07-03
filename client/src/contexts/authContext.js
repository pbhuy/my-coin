// @flow 
import React, { useState } from 'react';

export const authContext = React.createContext();

export const AuthProvider = (props) => {
    const [myWallet, setMyWallet] = useState({publicKey: '', privateKey: ''});
    const [auth, setAuth] = useState(false);

    const setWallet = (value) =>{
        setMyWallet(value);
        saveKey(value);
    }

    const saveKey = (value) => {
        sessionStorage.setItem('publicKey', value.publicKey);
        sessionStorage.setItem('privateKey', value.privateKey);
        sessionStorage.setItem('auth','true');
    }

    const loadKey = () => {
        setMyWallet({
            publicKey: sessionStorage.getItem('publicKey'),
            privateKey: sessionStorage.getItem('privateKey')
        })
        setAuth(sessionStorage.getItem('auth') === 'true');
    }

    const resetWallet = () =>{
        setMyWallet({publicKey: '', privateKey: ''});
        setAuth(false);
        sessionStorage.clear();
    }
    const setAuthentication = (value) =>{
        setAuth(value);
    }
    
    const exportContext = {
        myWallet,
        setMyWallet: setWallet,
        auth,
        setAuth: setAuthentication,
        resetWallet,
        loadKey
    }

    return (
        <authContext.Provider value={exportContext}>
            {props.children}
        </authContext.Provider>
    );
}