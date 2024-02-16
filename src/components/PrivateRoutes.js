import { Outlet, Navigate } from 'react-router';
import { useEffect } from 'react';
import Pool from "../UserPool.js";

const PrivateRoutes = () => { 
    useEffect(() => {
        const user = Pool.getCurrentUser();
        if (user) {
            user.getSession((err, session) => {
                if (err) {
                    return (<Navigate to='/login'/>);
                } else {
                    console.log(session);
                }
            });
        } else {
            return (<Navigate to='/login'/>);
        }
        return (<Outlet/>);
    })
}

export default PrivateRoutes