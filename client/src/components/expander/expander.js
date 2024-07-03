import './style.scss';
import {useState} from 'react';

export const Expander = (props) => {
    const [active, setActive] = useState('');
    const activeExpander = () =>{
        const activeValue = (active === '')?'active': '';
        setActive(activeValue);
    }

    return (
        <div className='expander'>
            <div className={`expander--title ${active}`} onClick={activeExpander}>
                <p>{props.question}</p>
                <div className='show-more-button'>
                    <div className='animated-button'>
                        <div className='bar bar1'></div>
                        <div className='bar'></div>
                    </div>
                </div>
            </div>
            <div className={`expander--content ${active}`}>
                <p className='text-content'>{props.answer}</p>
            </div>
        </div>
    );
};