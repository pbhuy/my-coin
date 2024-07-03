// @flow 
import React, { useState, useEffect } from 'react';
export const nodeHandleContext = React.createContext();

export const NodeHandleProvider = (props) => {
    const [blockchain, setBlockchain] = useState(null);

    const exportContext = {
        blockchain,
        setBlockchain
    }

    return (
        <nodeHandleContext.Provider value={exportContext}>
            {props.children}
        </nodeHandleContext.Provider>
    );
};