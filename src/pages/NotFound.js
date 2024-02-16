import React from 'react';
import { FileExclamationOutlined } from '@ant-design/icons'
import { useNavigate } from "react-router-dom";

import styles from './NotFound.module.css';

const NotFound = () => {

    const navigate = useNavigate();

    return (
        <div className={styles.pageWrap}>
            <div className={styles.topFlex}>
                <h1 className={styles.largeBold}>404</h1>
                <FileExclamationOutlined className={styles.errorIcon}/>
            </div>
            <h2 className={styles.mediumBold}>Page Not Found</h2>
            <h3 className={styles.bottomText}>The page you're looking for either doesn't exist or was unable to be reached</h3>
            <div className={styles.contentDivider}></div>
            <div className={styles.backBtn} onClick={() => {navigate(`/dashboard`)}}>Return to Homepage</div>
        </div>
    );
}
export default NotFound;