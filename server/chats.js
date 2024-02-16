import { v4 as uuidv4 } from 'uuid';
import express from 'express';
import {docClient} from './config.js';
import { Table } from 'antd';
const router = express.Router();

const getUserInfo = (userEmail) => {
    var params = {
        TableName: 'Users',
        Key: {
            email: userEmail,
        }
    }

    return docClient.get(params).promise();
};

const getUserInfoByID = (userID) => {
    var params = {
        TableName : "Users",
        IndexName : "userID-index",
        KeyConditionExpression: "userID = :id",
        ExpressionAttributeValues: {
            ":id": userID
        },
        ProjectionExpression: "email"
    }

    return docClient.query(params).promise();
};

const getUsername = (userID) => {
    var params = {
        TableName : "Users",
        IndexName : "userID-index",
        KeyConditionExpression: "userID = :id",
        ExpressionAttributeValues: {
            ":id": userID
        },
        ProjectionExpression: ["username"]
    }

    return docClient.query(params).promise();
}

router.post("/getUsername", (req, res) => {
    const id = req.body.id;

    getUsername(id)
    .then((data) => {
        res.send(data.Items[0].username);
    })
    .catch((err) => {
        res.send(err);
    })
})

const getDirectMessages = (userEmail) => {
    var params = {
        TableName: 'Users',
        Key: {
            email: userEmail,
        },
        AttributesToGet: ["directMessages"]
    }

    return docClient.get(params).promise();
}

router.post("/chat/getchats", (req, res) => {
    const userEmail = req.body.user;

    getDirectMessages(userEmail)
    .then((data) => {
        res.send(data.Item.directMessages);
    })
    .catch((err) => {
        console.log(err);
        res.send({});
    })
})

router.post("/chat/getchatslist", (req, res) => {
    const userEmail = req.body.user;

    getDirectMessages(userEmail)
    .then((data) => {
        let response = [];
        let promises = [];
        let dm = data.Item.directMessages;

        for(const key in data.Item.directMessages)
        {
            promises.push(
                getUsername(key)
                .then((data2) => {
                    response.push({sender: data2.Items[0].username, read: dm[key].read, chatID: dm[key].chatID, senderID: key});
                })
                .catch((err) => {
                    console.log(err);
                }
            ));
        }

        Promise.all(promises)
        .then(() => {
            res.send(response);
        })
        .catch((err) => {
            res.send(err);
        })
    })
    .catch((err) => {
        console.log(err);
        res.send("Uh oh stinky");
    });
})

const getChat = (chatID) => {
    var params = {
        TableName: 'Chats',
        Key: {
            id: chatID,
        }
    }

    return docClient.get(params).promise();
};

router.post("/chat/getchat", (req, res) => {
    const chatID = req.body.id;

    getChat(chatID)
    .then((data) => {
        res.send(data.Item);
    })
    .catch((err) => {
        console.log(err);
        res.send(null);
    }) 
})

const createChat = (user1, user2, id) => {
    let params = {
        TableName: "Chats",
        Item: {
            id: id,
            messages: [],
            user1: user1,
            user2: user2
        }
    }

    return docClient.put(params).promise();
}

router.post("/chat/createChat", (req, res) => {
    const user1Email = req.body.user1Email;
    const user2 = req.body.user2;
    const id = uuidv4();

    getUserInfo(user1Email)
    .then((data) => {
        const user1 = data.Item.userID;

        createChat(user1, user2, id)
        .then((data) => {
            getUserInfoByID(user1)
            .then((data) => {
                let email = data.Items[0].email;
                let params = {
                    TableName: "Users",
                    Key: { email: email },
                    UpdateExpression: "SET directMessages.#id = :chat",
                    ExpressionAttributeNames: {
                        "#id": user2
                    },
                    ExpressionAttributeValues: {
                        ":chat": {chatID: id, read: true}
                    }
                }

                docClient.update(params).promise()
                .then((data) => {
                    getUserInfoByID(user2)
                    .then((data) => {
                        let email = data.Items[0].email;
                        let params = {
                            TableName: "Users",
                            Key: { email: email },
                            UpdateExpression: "SET directMessages.#id = :chat",
                            ExpressionAttributeNames: {
                                "#id": user1
                            },
                            ExpressionAttributeValues: {
                                ":chat": {chatID: id, read: true}
                            }
                        }

                        docClient.update(params).promise();
                    })
                    .catch((err) => {
                        console.log(err);
                    })
                })
                .catch((err) => {
                    console.log(err);
                })
            })
            .catch((err) => {
                console.log(err);
            })

            getChat(id)
            .then((data) => {
                res.send(data.Item);
            })
            .catch((err) => {
                console.log(err);
            })
        })
    })
    .catch((err) => {
        console.log(err);
    })
})

const sendMessage = (sender, chatID, text) => {
    let params = {
        TableName: 'Chats',
        Key: {
            id: chatID
        },
        UpdateExpression: "SET messages = list_append(messages, :m)",
        ExpressionAttributeValues: {
            ":m": [{sender: sender, text: text}]
        }
    }

    return docClient.update(params).promise();
}

const setMessagesSeen = (isSeen, email, otherID) => {
    var params = {
        TableName : 'Users',
        Key: {
            email: email,
        },
        UpdateExpression: "SET directMessages.#other.#r = :seen",
        ExpressionAttributeNames: {
            "#other": otherID,
            "#r": "read"
        },
        ExpressionAttributeValues: {
            ":seen": isSeen
        }
    };

    return docClient.update(params).promise();
}

router.post("/chat/setChatSeen", (req, res) => {
    const isSeen = req.body.isSeen;
    const email = req.body.email;
    const otherID = req.body.otherID;

    setMessagesSeen(isSeen, email, otherID)
    .then((data) => {
        res.send("OK");
    })
    .catch((err) => {
        console.log(err);
        res.send("ERROR");
    })
})

router.post("/chat/sendmessage", (req, res) => {
    const sender = req.body.sender;
    const senderID = req.body.senderID;
    const chatID = req.body.id;
    const text = req.body.text;
    const receiver = req.body.receiver;

    sendMessage(sender, chatID, text)
    .then((data) => {
        getUserInfoByID(receiver)
        .then((data) => {
            setMessagesSeen(false, data.Items[0].email, senderID)
            .then((data) => {
                res.send("OK");
            })
            .catch((err) => {
                console.log(err);
                res.send("ERR");
            })
        })
        .catch((err) => {
            console.log(err);
        })
    })
    .catch((err) => {
        res.send("ERROR");
        console.log(err);
    })
})


router.post("/user/getNotifications", (req, res) => {
    const userEmail = req.body.userID;


    getUserInfo(userEmail)
    .then((data) => {
        res.send(data.Item.notifs);
    })
    .catch((err) => {
        console.log(userEmail);
        res.send({seen: true, notifs:[]});
    });
})

function addNotif(userID, notif) {
    var params = {
        TableName: "Users",
        Key: {email: userID},
        UpdateExpression: "SET notifs.notifs = list_append(notifs.notifs, :n), notifs.seen = :b",
        ExpressionAttributeValues: {":n": [notif], ":b": false}
    }

    return docClient.update(params).promise();
}

router.post("/user/addNotification", (req, res) => {
    const userID = req.body.userID;
    const notif = req.body.notif;

    getUserInfoByID(userID)
    .then((data) => {
        let email = data.Items[0].email;

        addNotif(email, notif)
        .then((data) => {
            res.send("Added notif");
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Failed to add notif");
        })
    })
    .catch((err) => {
        console.log(err);
        res.status(500).send("Failed to find user");
    })
})

function deleteNotif(userID, index) {
    var params = {
        TableName: 'Users',
        Key: {email: userID},
        UpdateExpression: "REMOVE notifs.notifs[" + index + "]",
    }

    return docClient.update(params).promise();
}

router.post("/user/deleteNotification", (req, res) => {
    const notif = JSON.stringify(req.body.notif);
    const userID = req.body.userID;

    getUserInfo(userID)
    .then((data) => {
        let index = -1;

        for (var i = 0; i < data.Item.notifs.notifs.length; i++) 
        {
            if (JSON.stringify(data.Item.notifs.notifs[i]) === notif) 
            {
                index = i;
                break;
            }
        }

        if(index == -1)
        {
            res.send("Notification not found");
        }
        else
        {
            res.send("dadadadwawda")
            deleteNotif(userID, index);
        }
    })
    .catch((err) => {
        res.send("awdawd");
        console.error(err);
    });
});

function updateNotifsSeen(userID) {
    var params = {
        TableName : 'Users',
        Key: {
            email: userID,
        },
        UpdateExpression: `SET notifs.seen = :seen`,
        ExpressionAttributeValues: {
            ":seen": true
        }
    };

    return docClient.update(params).promise();
}

router.post("/user/setNotifsSeen", (req, res) => {
    const userID = req.body.userID;

    updateNotifsSeen(userID)
    .then((data) => {
        res.send("notifcations seen");
    })
    .catch((err) => {
        console.error(err);
        res.send(err);
    });
});

export default router;