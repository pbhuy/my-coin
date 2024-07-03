// @flow 
import * as React from 'react';
import './style.scss';

export const NotRecommended = (props) => {
    return (
        <div className={`recommended ${(props.state !== 'hidden') ? '' : 'recommended--hidden'}`}>
            <i className="fa fa-exclamation-triangle fa-3x recommended__icon" aria-hidden="true"></i>
            <div className='recommended__text'>
                <div className='text'>
                    <p className='text__title'>NOT RECOMMENDED</p>
                    <h5 className='text__desc'>This is not a recommended way to create your wallet. Due to the sensitivity of the information involved, these options should only be used in offline settings by experienced users.</h5>
                </div>
                <div className='direct-link'>
                    Read: <span className='direct-link__link'>Using MEW Offline</span>
                </div>
            </div>
        </div>
    );
};