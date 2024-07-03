// @flow 
import React, { useState } from 'react';

export const interfaceOptionContext = React.createContext();

export const InterfaceOptionProvider = (props) => {
    const [option, setOption] = useState(1);

    const setCurrentOption = (value) =>{
        setOption(value);
    }
    
    const exportContext = {
        option,
        setInterfaceOption: setCurrentOption
    }

    return (
        <interfaceOptionContext.Provider value={exportContext}>
            {props.children}
        </interfaceOptionContext.Provider>
    );
};