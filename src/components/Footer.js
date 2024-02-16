import React, { useState, useEffect } from 'react';
import routes from '../constants/Routes';
import styles from './Footer.module.css';

function Footer() {
  const [width, setWidth] = useState(window.innerWidth);
  const isMobile = width <= 768;

  const handleWindowSizeChange = () =>
  {
      setWidth(window.innerWidth);
  }

  useEffect(() => {
        window.addEventListener('resize', handleWindowSizeChange);
        return () => {
            window.removeEventListener('resize', handleWindowSizeChange);
        }
    }, []);
    if(isMobile){
    return (
        <div className={styles["main-footer"]}>
          <div className={styles["container"]}>
            <div className={styles["row"]}>
              {/* Column1 */}
              <div className={styles["col"]}>
                <div className={styles["section"]} >
                    <h4>About </h4>
                </div>
                <div className={styles["list-links"]}>
                <hr />
                <li className={styles["list-footer"]}>
                    <a
                        className={styles["link-footer"]}
                        style={{ cursor:"pointer" }}
                        href={routes.faq}>
                        FAQ
                    </a>
                </li>
                <li className={styles["list-footer"]}>
                    <a
                        className={styles["link-footer"]}
                        style={{ cursor:"pointer" }}
                        href={routes.about}>
                        About Us
                    </a>
                </li>
                <li className={styles["list-footer"]}>
                    <a
                        className={styles["link-footer"]}
                        style={{ cursor:"pointer" }}
                        href={routes.privacyPolicy}>
                        Privacy Policy
                    </a>
                </li>
                </div>
              </div>
              {/* Column2 */}
              <div className={styles["col"]}>
                <div className={styles["section"]} >
                <h4>Contact </h4>
                </div>
                <div className={styles["list-links"]}>
                <hr />
                <li className={styles["list-footer"]}>
                    <a
                        className={styles["link-footer"]}
                        style={{ cursor:"pointer" }}
                        href={routes.contact}>
                        Contact Us
                    </a>
                </li>
                </div>
              </div>
            </div>

            <div className={styles["row1"]}>
              <p className={styles["col-sm"]}>
                &copy; Copyright {new Date().getFullYear()}, Event Planner All
              </p>
              <p className={styles["col-sm"]}>
              Rights Reserved
              </p>
            </div>
          </div>
        </div>
      );
    }
    else{
      return(
      <div className={styles["main-footer"]}>
          <div className={styles["container"]}>
            <div className={styles["desktop-row"]}>
              {/* Column1 */}
              <div className={styles["col"]}>
                <div className={styles["list-links"]}>
                <hr />
                <li className={styles["desktop-list-footer"]}>
                    <a
                        className={styles["link-footer"]}
                        style={{ cursor:"pointer" }}
                        href={routes.faq}>
                        FAQ
                    </a>
                </li>
                <li className={styles["desktop-list-footer"]}>
                    <a
                        className={styles["link-footer"]}
                        style={{ cursor:"pointer" }}
                        href={routes.about}>
                        About Us
                    </a>
                </li>
                <li className={styles["desktop-list-footer"]}>
                    <a
                        className={styles["link-footer"]}
                        style={{ cursor:"pointer" }}
                        href={routes.privacyPolicy}>
                        Privacy Policy
                    </a>
                </li>
                <li className={styles["desktop-list-footer"]}>
                    <a
                        className={styles["link-footer"]}
                        style={{ cursor:"pointer" }}
                        href={routes.contact}>
                        Contact Us
                    </a>
                </li>
                </div>
              </div>
              {/* Column2 */}
              <div className={styles["col"]}>
                <hr />
              </div>
            </div>

            <div className={styles["row1"]}>
              <p className={styles["col-sm"]}>
                &copy; Copyright {new Date().getFullYear()}, Event Planner All
              </p>
              <p className={styles["col-sm"]}>
              Rights Reserved
              </p>
            </div>
          </div>
        </div>
      );
    }
    }
export default Footer;
