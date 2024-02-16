import styles from './AboutUs.module.css';

function AboutUs() {
    return (
        <div className={styles["page-wrap"]}>
            <div className={styles["center-body-about"]}>
                <div className={styles["body-title-about"]}>About Us</div>
                <div className={styles["mission-text"]}>
                    The Event Planner is a modern web app that is being developed from the ground up at the request of the client who first conceived the idea of an event planning tool.  
                    There likely exist similar event planning tools online, however, the specifications listed are unique to this app alone and are not derived from any third-party applications.
                </div>
                <div className={styles["dev-title"]}>
                    <img className={styles["dev-img"]} src={require("../assets/JustinM-github.jpg")} alt="Justin "/>
                    Justin Murray
                </div>
                <div className={styles["dev-job"]}>Team Lead</div>
                <div className={styles["dev-info"]}>
                    GitHub: <a className={styles["dev-github"]} href="https://github.com/JustinMurray37">JustinMurray37</a>
                </div>
                <div className={styles["dev-info"]}>Email: jm104018@ohio.edu</div>
                <div className={styles["dev-title"]}>
                    <img className={styles["dev-img"]} src={require("../assets/JustinA-github.jpg")} alt="Justin "/>
                    Justin Adie
                </div>
                <div className={styles["dev-job"]}>Documentation Manager</div>
                <div className={styles["dev-info"]}>
                    GitHub: <a className={styles["dev-github"]} href="https://github.com/j-adie456980">j-adie456980</a>
                </div>
                <div className={styles["dev-info"]}>Email: ja585618@ohio.edu</div>
                <div className={styles["dev-title"]}>
                    <img className={styles["dev-img"]} src={require("../assets/Gyver-github.jpg")} alt="Gyver "/>
                    Gyver Blessing
                </div>
                <div className={styles["dev-job"]}>Quality Assurance</div>
                <div className={styles["dev-info"]}>
                    GitHub: <a className={styles["dev-github"]} href="https://github.com/Gyver-Blessing">Gyver-Blessing</a>
                </div>
                <div className={styles["dev-info"]}>Email: gb033519@ohio.edu</div>
                <div className={styles["dev-title"]}>
                    <img className={styles["dev-img"]} src={require("../assets/Bradey-github.jpg")} alt="Bradey "/>
                    Bradey Lounsbury
                </div>
                <div className={styles["dev-job"]} font-weight='bold'>Release Manager</div>
                <div className={styles["dev-info"]}>
                    GitHub: <a className={styles["dev-github"]} href="https://github.com/BradeyLounsbury">BradeyLounsbury</a>
                </div>
                <div className={styles["dev-info"]}>Email: bl396918@ohio.edu </div>
            </div>
        </div>
    );
}

export default AboutUs;