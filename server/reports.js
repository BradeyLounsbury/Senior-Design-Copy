import { v4 as uuidv4 } from 'uuid';
import express from 'express';
import {docClient} from './config.js';
const router = express.Router();

// Report User

router.post("/api/submitUserReport", (req, res) => {
    const id = uuidv4();
    var params = {
    TableName: 'Reports',
    Item: {
        id: id,
        userID: req.body.userID,
        reason: req.body.reason,
        comments: req.body.comments,
    }
    }

    docClient.put(params).promise()
        .then((_) => {
            console.log(`User (${req.body.userID}) successfully reported. 
            \nReason: ${req.body.reason} 
            \nAdditional Comments: ${req.body.comments}`);
            res.send("User Successfully Reported!");
        })
        .catch((err) => {
            res.send(err);
        })
    });

// End of Report User

export default router;