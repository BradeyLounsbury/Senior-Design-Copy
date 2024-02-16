import { v4 as uuidv4 } from 'uuid';
import express, { response } from 'express';
import { docClient, S3 } from './config.js';
import fs from 'fs';
import multer, { memoryStorage } from 'multer';
const router = express.Router();
const upload = multer();

// Create Profile

router.post("/api/createProfile", (req, res) => {
    const id = uuidv4();
    var params = {
    TableName: 'Users',
    Item: {
        email: req.body.email,
        age: req.body.age,
        bio: req.body.bio,
        directMessages: {},
        events: "",
        favorites: req.body.favorites,
        friends: ",",
        gender: req.body.gender,
        groups: "",
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        notifs: {seen: true, notifs:[]},
        pfp: ",",
        phone: req.body.phone,
        userID: id,
        username: req.body.username,
        ownedGroups: {}
    }
    }

    docClient.put(params).promise()
    .then((_) => {
    console.log("user added to db");
    res.send("user added to db");
    })
    .catch((err) => {
    res.send(err);
    })
});

// End of create profile

// Profile update

function updateProfile(req) {
    var params = {
        TableName : 'Users',
        Key: {
        email: req.body.email,
        },
        UpdateExpression: `SET #firstName = :firstName, #lastName = :lastName, #bio = :bio, 
        #username = :username, #phone = :phone, #age = :age, #gender = :gender, #favorites = :favorites`,
        ExpressionAttributeNames: {
        '#firstName': "firstName",
        '#lastName': "lastName", 
        '#bio': "bio",
        '#username': "username",
        '#phone': "phone",
        '#age': "age",
        '#gender': "gender",
        '#favorites': "favorites",
        },
        ExpressionAttributeValues: {
        ":firstName": req.body.firstName,
        ":lastName": req.body.lastName,
        ":bio": req.body.bio,
        ":username": req.body.username,
        ":phone": req.body.phone,
        ":age": req.body.age,
        ":gender": req.body.gender,
        ":favorites": req.body.favorites,
        }
    };

    return docClient.update(params).promise();
}

router.post("/api/updateProfile", (req, res) => {
    updateProfile(req)
    .then((_) => {
        console.log("profile updated");
        res.send("profile updated");
    })
    .catch((err) => {
        res.send(err);
    })
});

// End of profile update

// Get profile

const getProfile = (req) => {
    const email = req.body.email;
    var params = {
        TableName: 'Users',
        FilterExpression: '#email = :email',
        ExpressionAttributeNames: {
        '#email': 'email',
        },
        ExpressionAttributeValues: {
            ':email': email
        },
    }

    return docClient.scan(params).promise();
};

router.post("/api/getProfile", (req, res) => {
    getProfile(req)
        .then((data) => {
        if (data.Items.length === 0) {
            console.log("user not in db");
            res.send("user not in db");
        }
        res.send(data.Items[0]);
        
        })
        .catch((err) => {
        console.error(err);
        res.send(err);
        });
});

const getUserInfoByID = (userID) => {
    var params = {
        TableName : "Users",
        IndexName : "userID-index",
        KeyConditionExpression: "userID = :id",
        ExpressionAttributeValues: {
            ":id": userID
        }
    }

    return docClient.query(params).promise();
};

router.post("/api/getProfileByID", (req, res) => {
    const id = req.body.id;
    getUserInfoByID(id)
    .then((data) => {
        if (data.Items.length === 0) {
            console.log("user not in db..");
            res.send("user not in db..");
        }
        res.send(data.Items[0]);
        
        })
        .catch((err) => {
        console.error(err);
        res.send(err);
        });
})

// End of get profile

// Profile pic upload

router.post("/api/uploadPFP", upload.single('pfp'), (req, res) => {
    const file = req.file;
    const id = req.body.id;

    S3.upload({
        Bucket: 'ctat-pfp',
        Key: id,
        Body: file.buffer
    }).promise()
    .then((_) => {
        console.log('pfp updated');
        res.send('pfp updated');
    }).catch((err) => {
        console.log(err);
        res.status(500).send(err);
    })
})

// End of profile pic upload

// Get profile pic

router.post("/api/getPFP", (req, res) => {
    const id = req.body.id;

    S3.getSignedUrlPromise('getObject', {
        Bucket: 'ctat-pfp',
        Key: id
    }).then((response) => {
        res.send(response);
    }).catch((err) => {
        console.log(err);
    })
})

// End of get profile pic

// Search profiles

router.post("/api/searchProfiles", (req, res) => {
    let profiles = [];
    docClient.scan({
        TableName: "Users",
    }).promise()
    .then((response) => {
        for (let i = 0; i < response.Count; i++) {
            profiles.push([response.Items[i].userID, response.Items[i].username]);
        }
        res.send(profiles);
    })
    .catch((err) => {
        console.log(err);
        res.status(500).send(err);
    })
})

// End of search profiles

// Ban profile

router.post("/api/banUser", (req, res) => {
    const banVal = true;
    var params = {
        TableName : 'Users',
        Key: {
            email: req.body.email,
        },
        UpdateExpression: `SET #isBanned = :isBanned`,
        ExpressionAttributeNames: {
            '#isBanned': "isBanned",
        },
        ExpressionAttributeValues: {
            ":isBanned": banVal,
        }
    };
    docClient.update(params).promise()
    .then((_) => {
        console.log("User Successfully Banned!");
        res.send("User Successfully Banned!");
    })
    .catch((err) => {
        console.log(err);
        res.send(err);
    })
})

// End of ban profile

// Unban profile

router.post("/api/unbanUser", (req, res) => {
    const banVal = false;
    var params = {
        TableName : 'Users',
        Key: {
            email: req.body.email,
        },
        UpdateExpression: `SET #isBanned = :isBanned`,
        ExpressionAttributeNames: {
            '#isBanned': "isBanned",
        },
        ExpressionAttributeValues: {
            ":isBanned": banVal,
        }
    };
    docClient.update(params).promise()
    .then((_) => {
        console.log("User Successfully Unbanned!");
        res.send("User Successfully Unbanned!");
    })
    .catch((err) => {
        console.log(err);
        res.send(err);
    })
})

// End of unban profile

export default router;