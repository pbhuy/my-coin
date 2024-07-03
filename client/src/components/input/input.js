import "./style.scss";
import React,{useState} from 'react';

const iconStylePassword = ['eye', 'eye-slash'];

export const Input  = (props) => {
  const [Type,setType] = useState(props.type);
  const flag = (props.type === 'password')? true : false;

  const switchType = (e) => {
    setType((Type === 'password')? 'text' : 'password');
  };

  return (
    <div className={`input ${props.className}`}>
      <div className="main-content">
        {typeof props.iconStyle === "object" && (
          <i
            className={`input__right-icon fa fa-${props.iconStyle.icon}`}
            aria-hidden="true"
          ></i>
        )}
        <input
          onChange={props.onChangeText}
          className="input__text"
          type={`${Type}`}
          placeholder={props.placeHolder}
          value={props.value}
          name={props.name}
          id={`txt${props.name}`}
        />
      </div>
      {
        flag && 
        <div className="option-content">
        <i
          className={`input__right-icon fa fa-${iconStylePassword[(Type === 'password')?1:0]}`}
            aria-hidden="true"
            onClick={switchType}
          ></i>
      </div>
      }
    </div>
  );
}