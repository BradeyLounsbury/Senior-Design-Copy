import React, {useState} from 'react';
import { CloseOutlined } from '@ant-design/icons'
import styles from './CustomModal.module.css';

const CustomModal = (props) => {
  return (
    <div>
      {props.isOpen &&
        <div className={styles["modal-wrap"]}>
        <div className={styles["modal-content"]}>
          <div className={styles["modal-content-top"]}>
            <h3 className={styles["modal-title"]}>{props.title}</h3>
            <CloseOutlined className={styles["modal-close-icon"]} onClick={props.handleClose}/>
          </div>
          <div className={styles["modal-content-main"]}>
            {props.children}
          </div>
          <div className={styles["modal-content-bottom"]}>
            {props.cancelTxt && 
              <div className={styles["cancel-btn"]} onClick={props.handleCancel}>{props.cancelTxt}</div>
            }
            {props.submitTxt && 
              <div className={styles["submit-btn"]} onClick={props.handleSubmit}>{props.submitTxt}</div>
            }
          </div>
        </div>
      </div>
      }
    </div>
  );
}
export default CustomModal;