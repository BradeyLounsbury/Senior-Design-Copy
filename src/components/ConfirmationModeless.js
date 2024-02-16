import React, { useRef, useEffect, useState} from 'react';
import styles from './ConfirmationModeless.module.css';
import {CloseCircleOutlined, CheckCircleOutlined} from '@ant-design/icons';

const ModelessContext = React.createContext(null);

const ConfirmationModeless = (props) => {

    var icon;
    if(props.success)
        icon = <CheckCircleOutlined className={styles['success-icon']}/>;
    else
        icon = <CloseCircleOutlined className={styles['failure-icon']}/>;

    return (
        <div className={styles["confirmation-modeless"]}>
            {icon}
            {props.text}
        </div>
    );
}

export {ModelessContext, ConfirmationModeless};