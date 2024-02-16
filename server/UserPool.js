import { CognitoUserPool } from "amazon-cognito-identity-js";
import dotenv from 'dotenv';
dotenv.config({ path: '../.env'});

const poolData = {
    UserPoolId: process.env.USER_POOL_ID,
    ClientId: process.env.USER_POOL_CLIENT_ID
}

export default new CognitoUserPool(poolData)