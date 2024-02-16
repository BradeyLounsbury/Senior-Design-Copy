import { v4 as uuidv4 } from 'uuid';
import express from 'express';
import { docClient, S3 } from './config.js';
import multer from 'multer';
const router = express.Router();
const upload = multer();

// Create group

function addOwnedGroup(email, groupID)
{
  var params = {
    TableName: "Users",
    Key: {email: email},
    UpdateExpression: "SET ownedGroups.#g = :n",
    ExpressionAttributeNames: {"#g": groupID},
    ExpressionAttributeValues: {":n": null}
  }

  return docClient.update(params).promise();
}

router.post("/api/createGroup", (req, res) => {
  const id = uuidv4();
  var params = {
    TableName: 'Users',
    Key: {
      email: req.body.email,
    }
  }

  docClient.get(params).promise()
  .then((data) => {
    var params = {
      TableName : 'Groups',
      Item: {
        id: id,
        title: req.body.title,
        desc: req.body.desc,
        activities: req.body.activities,
        roster: req.body.roster,
        owner: req.body.owner,
        requests: {},
        events: {}
      }
    };

    docClient.put(params).promise()
    .then((_) => {
      addOwnedGroup(req.body.email, id);

      console.log("group created");
      res.send(id);
    })
    .catch((err) => {
      console.error(err);
      res.send(err);
    })
    
    let groups = data.Item.groups;
    (groups === undefined || groups === null) ? groups = (id + ',') : groups += (id + ',');
    var params = {
      TableName: 'Users',
      Key: {
        email: req.body.email,
      },
      UpdateExpression: 'SET groups = :groups',
      ExpressionAttributeValues: {
        ":groups": groups,
      }
    };
    docClient.update(params).promise();
  })
  .catch((err) => {
    console.error(err);
    res.send(err);
  })
});

// End of create group

// Delete Group
router.post("/api/deleteGroup", (req, res) => {
  const id = req.body.id;
  const email = req.body.email;

  var params = {
    TableName: 'Users',
    Key: {
      email: email,
    }
  }
  
  docClient.get(params).promise()   //get user
    .then((data) => {
      console.log("user collected");
      let groups = data.Item.groups;

      if (groups.includes(id+',')) {
        console.log("Group ID located for deletion");
        groups = groups.replace(id+',', '');
        var params = {
          TableName: 'Users',
          Key: {
            email: email,
          },
          UpdateExpression: 'SET groups = :groups',
          ExpressionAttributeValues: {
            ":groups": groups,
          },
        };
        docClient.update(params).promise()
        .then(() => {
          console.log("Group successfully removed from group list of user");
          var params = {
            Key: {
              id: id
            },
            TableName: "Groups"
          }
          docClient.delete(params, function(err, data){
            if(err) res.send(err);
            else res.send(data);
          });
        })
      }
      else {
        console.log(`Group ID ${id} not found in group list of user`);
      }
    })
})
// Grab group owner

router.post("/api/grabGroupOwner", (req, res) => {
  getGroupByID(req.body.id)
  .then((group) => {
    let userID = group.Item.owner;
    var params = {
      TableName: 'Users',
      IndexName: 'userID-index',
      KeyConditionExpression: '#userID = :v_userID',
      ExpressionAttributeNames: {
        '#userID': 'userID'
      },
      ExpressionAttributeValues: {
        ':v_userID': userID
      }
    }

    docClient.query(params).promise()
    .then((user) => {
      res.send(user);
    })
  })
  .catch((err) => {
    console.log(err);
    res.send(err);
  })
})

// End of grab group owner

// Grab groups

router.post("/api/grabPubGroups", (req, res) => {
  var params = {
    TableName: 'Groups',
  }

  docClient.scan(params).promise()
  .then((data) => {
    console.log("pub groups sent");
    res.send(data.Items);
  });
});

async function groupForWrap(group_array, groups) {
  try {
    for (let i = 0; i < group_array.length; i++) {
      var params = {
        TableName: 'Groups',
        Key: {
          id: group_array[i],
        }
      };

      await docClient.get(params).promise()
      .then((data) => {
        groups.push(data);
      })
    };

    return groups;
  } catch(err) {
    console.error(err);
    throw err;
  }
}

router.post("/api/grabPrivGroups", (req, res) => {
  var params = {
    TableName: 'Users',
    Key: {
      email: req.body.email,
    }
  }
  let groups = [];

  docClient.get(params, function (err, data) {
    if (err) res.send(err);
    else {
      if (data.Item.groups !== undefined && data.Item.groups !== null && data.Item.groups.length > 1) {
        let group_array = data.Item.groups.split(',');
        group_array.pop();  //removes null string that comes at end from split()

        groupForWrap(group_array, groups)
        .then((data) => {
          console.log("priv groups sent");
          res.send(data);
        })
        .catch((err) => {
          res.send(err);
          console.error(err);
        })
      } else {
        console.log("user has no groups");
        res.send([]);
      }
    }
  })
});

// End of grab groups

// Is group owner

router.post("/api/isGroupOwner", (req, res) => {
  getGroupByID(req.body.id)
  .then((group) => {
    let groupUserID = group.Item.owner;
    var params = {
      TableName: 'Users',
      Key: {
        email: req.body.email,
      }
    }
  
    docClient.get(params).promise()
    .then((user) => {
      if (user.Item.userID === groupUserID) {
        res.send(true);
      } else {
        res.send(false);
      }
    })
    .catch((err) => {
      console.log(err);
    })
  })
});

// End of is group owner

// Get group by ID

const getGroupByID = (groupID) => {
  var params = {
    TableName: 'Groups',
    Key: {
      id: groupID,
    }
  }

  return docClient.get(params).promise();
};

router.post("/api/getGroup", (req, res) => {
  getGroupByID(req.body.groupID)
    .then((data) => {
      console.log("Group sent successfully");
      res.send(data);
    })
    .catch((err) => {
      console.error(err);
      res.send(err);
    });
});

// End of get group by ID



// Join Group

router.post("/api/joinGroup", (req, res) => {
  console.log("joining group...");
  const email = req.body.email;
  const id = req.body.id;

  var params = {
    TableName: 'Users',
    Key: {
      email: email,
    }
  }
  
  docClient.get(params).promise()   //get user
    .then((data) => {
      console.log("user collected");
      let groups = data.Item.groups;
      let userID = data.Item.userID;

      if (groups === undefined || groups === null || !groups.includes(id)) {
        if (groups === ',') {
          groups = (id + ',');
        } else {
          (groups === undefined || groups === null) ? groups = (id + ',') : groups += (id + ',');
        }
        var params = {
          TableName: 'Users',
          Key: {
            email: email,
          },
          UpdateExpression: 'SET groups = :groups',
          ExpressionAttributeValues: {
            ":groups": groups,
          },
        };
        docClient.update(params).promise()   //add group to user
          .then((_) => {
            console.log("group added to user")
            getGroupByID(id)  //get group
              .then((data) => {
                let roster = data.Item.roster
                roster.push(userID);
                var params = {
                  TableName: 'Groups',
                  Key: {
                    id: id,
                  },
                  UpdateExpression: 'SET roster = :roster',
                  ExpressionAttributeValues: {
                    ":roster": roster,
                  },
                };
                docClient.update(params, function(err, data) {  //increment group members
                  if (err) {
                    console.error(err);
                    res.send(err);
                  } else {
                    console.log("group joined successfully");
                    res.send("group joined");
                  }
                });
              })
              .catch((err) => {
                console.error(err);
                res.send(err);
              })
          })
          .catch((err) => {
            console.error(err);
            res.send(err);
          })
      } else {
        console.error("User already joined group");
        res.send("User already joined group");
      }
    })
    .catch((err) => {
      console.error(err);
      res.send(err);
    })
});

// End of join group



// Leave group

router.post("/api/leaveGroup", (req, res) => {
  const email = req.body.email;
  const id = req.body.id;

  var params = {
    TableName: 'Users',
    Key: {
      email: email,
    }
  }
  
  docClient.get(params).promise()   //get user
    .then((data) => {
      console.log(data);
      console.log(id);
      RemoveMember(id, email, data.Item.userID, data.Item.groups, res);
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    })
});

// End of leave group

// Remove member

router.post("/api/removeMember", (req, res) => {
  const userID = req.body.member;
  const id = req.body.id;

  let params = {
    TableName : "Users",
    IndexName : "userID-index",
    KeyConditionExpression: "userID = :id",
    ExpressionAttributeValues: {
        ":id": userID
    }
  }

  docClient.query(params).promise()
  .then((data) => {
    RemoveMember(id, data.Items[0].email, userID, data.Items[0].groups, res);
  })
  .catch((err) => {
    console.log(err);
    res.send(err);
  })
})

// End of remove member

// Remove member function

const RemoveMember = (id, email, userID, groups, res) => {
  if (groups.includes(id+',')) {
    groups = groups.replace(id+',', '');
    var params = {
      TableName: 'Users',
      Key: {
        email: email,
      },
      UpdateExpression: 'SET groups = :groups',
      ExpressionAttributeValues: {
        ":groups": groups,
      },
    };
    docClient.update(params).promise()   //remove group from user
      .then((_) => {
        getGroupByID(id)  //get group
          .then((data) => {
            let roster = data.Item.roster
            let idx = roster.indexOf(userID);
            if (idx !== -1) {roster.splice(idx, 1);}  
            var params = {
              TableName: 'Groups',
              Key: {
                id: id,
              },
              UpdateExpression: 'SET roster = :roster',
              ExpressionAttributeValues: {
                ":roster": roster,
              },
            };
            docClient.update(params, function(err, data) {  //decrement group members
              if (err) {
                console.error(err);
                res.send(err);
              } else {
                console.log("group left successfully");
                res.send("group left");
              }
            });
          })
          .catch((err) => {
            console.error(err);
            res.send(err);
          })
      })
      .catch((err) => {
        console.error(err);
        res.send(err);
      })
  } else {
    console.error("User not part of group");
    res.send("User not part of group");
  }
}
// End of remove member function

// Update group

router.post("/api/updateGroup", (req, res) => {
  var params = {
    TableName: 'Groups',
    Key: {
      id: req.body.id,
    },
    UpdateExpression: `SET #title = :title, #desc = :desc, #roster = :roster, #activities = :activities`,
    ExpressionAttributeNames: {
      '#title': "title",
      '#desc': "desc",
      '#roster': "roster",
      '#activities': "activities"
    },
    ExpressionAttributeValues: {
      ":title": req.body.title,
      ":desc": req.body.desc,
      ":roster": req.body.members,
      ":activities": req.body.activities
    }
  };

  docClient.update(params).promise()
  .then((_) => {
    console.log("group updated");
    res.send([]);
  })
  .catch((err) => {
    console.log(err);
    res.send(err);
  })
})

// End of update group

// Update members names

async function memberForWrap(memberIDs, memberNames) {
  try {
    for (let i = 0; i < memberIDs.length; i++) {
      var params = {
        TableName: 'Users',
        IndexName: 'userID-index',
        KeyConditionExpression: '#userID = :v_userID',
        ExpressionAttributeNames: {
          '#userID': 'userID'
        },
        ExpressionAttributeValues: {
          ':v_userID': memberIDs[i]
        }
      }
  
      await docClient.query(params).promise()
      .then((data) => {
        let memberTuple = [memberIDs[i], data.Items[0].username];
        memberNames.push(memberTuple);
      })
    };
    
    return memberNames;
  } catch(err) {
    console.error(err);
    throw err;
  }
}

router.post("/api/memberNames", (req, res) => {
  let memberIDs = req.body.members;
  if (memberIDs === [] || memberIDs === undefined || memberIDs === null) {
    res.send([])
  } else {
    let memberNames = [];
    memberForWrap(memberIDs, memberNames)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err);
    })
  }
})

// End of update members names

// Upload group banner

router.post("/api/uploadGroupBanner", upload.single('banner'), (req, res) => {
  const file = req.file;
    const id = req.body.id;

    S3.upload({
        Bucket: 'ctat-group-banner',
        Key: id,
        Body: file.buffer
    }).promise()
    .then((_) => {
        console.log('group banner updated');
        res.send('group banner updated');
    }).catch((err) => {
        console.log(err);
        res.status(500).send(err);
    })
})

// End of upload group banner

// Get group banner

router.post("/api/getGroupBanner", (req, res) => {
  const id = req.body.id;

  S3.getSignedUrlPromise('getObject', {
    Bucket: 'ctat-group-banner',
    Key: id
  }).then((response) => {
    res.send(response);
  }).catch((err) => {
    console.log(err);
  })
})

// End of get group banner

const getGroupRequests = (groupID) => {
  var params = {
      TableName: 'Groups',
      Key: {
          id: groupID,
      },
      AttributesToGet: ["requests"]
  }

  return docClient.get(params).promise();
}

router.post("/api/getGroupRequests", (req, res) => {
  const id = req.body.id;

  getGroupRequests(id)
  .then((data) => {
    res.send(data.Item.requests);
  })
  .catch((err) => {
    res.send([]);
  })
})

const removeGroupRequest = (groupID, userID) => {
  var params = {
    TableName: "Groups",
    Key: {id: groupID},
    UpdateExpression: "REMOVE requests.#id",
    ExpressionAttributeNames: {"#id": userID}
  }

  return docClient.update(params).promise();
}

const getUserEmail = (userID) => {
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

function addNotif(userID, notif) {
  var params = {
      TableName: "Users",
      Key: {email: userID},
      UpdateExpression: "SET notifs.notifs = list_append(notifs.notifs, :n), notifs.seen = :b",
      ExpressionAttributeValues: {":n": [notif], ":b": false}
  }

  return docClient.update(params).promise();
}

function getGroupName(groupID) {
  var params = {
    TableName: "Groups",
    Key: {id: groupID},
    AttributesToGet: ["title"]
  }

  return docClient.get(params).promise();
}

router.post("/api/decideGroupRequest", (req, res) => {
  const groupID = req.body.groupID;
  const userID = req.body.userID;
  const accept = req.body.accept;

  if(accept)
  {
    getUserEmail(userID)
    .then((data) => {
      console.log("joining group...");
      const email =  data.Items[0].email;
      const id = groupID;

      var params = {
        TableName: 'Users',
        Key: {
          email: email,
        }
      }
      
      docClient.get(params).promise()   //get user
        .then((data) => {
          console.log("user collected");
          let groups = data.Item.groups;
          let userID = data.Item.userID;

          if (groups === undefined || groups === null || !groups.includes(id)) {
            if (groups === ',') {
              groups = (id + ',');
            } else {
              (groups === undefined || groups === null) ? groups = (id + ',') : groups += (id + ',');
            }
            var params = {
              TableName: 'Users',
              Key: {
                email: email,
              },
              UpdateExpression: 'SET groups = :groups',
              ExpressionAttributeValues: {
                ":groups": groups,
              },
            };
            docClient.update(params).promise()   //add group to user
              .then((_) => {
                console.log("group added to user")
                getGroupByID(id)  //get group
                  .then((data) => {
                    let roster = data.Item.roster
                    roster.push(userID);
                    var params = {
                      TableName: 'Groups',
                      Key: {
                        id: id,
                      },
                      UpdateExpression: 'SET roster = :roster',
                      ExpressionAttributeValues: {
                        ":roster": roster,
                      },
                    };
                    docClient.update(params, function(err, data) {  //increment group members
                      if (err) {
                        console.error(err);
                        res.send(err);
                      } else {
                        console.log("group joined successfully");
                        res.send("group joined");

                        removeGroupRequest(groupID, userID)
                        .then((data) => {})
                        .catch((err) => {})

                        getGroupName(groupID)
                        .then((data) => {
                          addNotif(email, {type:"group-request-decision", group: data.Item.title, accept: true});
                        })
                        .catch((err) => {})
                      }
                    });
                  })
                  .catch((err) => {
                    console.error(err);
                    res.send(err);
                  })
              })
              .catch((err) => {
                console.error(err);
                res.send(err);
              })
          } else {
            removeGroupRequest(groupID, userID)
              .then((data) => {})
              .catch((err) => {})
            console.error("User already joined group");
            res.send("User already joined group");
          }
        })
        .catch((err) => {
          console.error(err);
          res.send(err);
        })
    })
  }
  else
  {
    removeGroupRequest(groupID, userID)
    .then((data) => {
      getGroupName(groupID)
      .then((data) => {
        getUserEmail(userID)
        .then((data2) => {
          addNotif(data2.Items[0].email, {type:"group-request-decision", group: data.Item.title, accept: false})
          .then((data) => {})
          .catch((err) => {console.log(err)});
        })
      })
      .catch((err) => {console.log(err)});

      res.send("Very cool very swag i like it");
    })
    .catch((err) => {
      res.status(500).send("uh oh stinky");
    })
  }
})

const getUserInfo = (userEmail) => {
  var params = {
      TableName: 'Users',
      Key: {
          email: userEmail,
      }
  }

  return docClient.get(params).promise();
};

function RequestJoinGroup(userID, groupID)
{
  var params = {
    TableName: "Groups",
    Key: {id: groupID},
    UpdateExpression: "SET requests.#id = :n",
    ExpressionAttributeNames: {"#id": userID},
    ExpressionAttributeValues: {":n": null}
  }

  return docClient.update(params).promise();
}

router.post("/api/requestJoinGroup", (req, res) => {
  const email = req.body.email;
  const groupID = req.body.groupID;

  getUserInfo(email)
  .then((data1) => {
    RequestJoinGroup(data1.Item.userID, groupID)
    .then((d) => {
      getGroupByID(groupID)
      .then((data2) => {
        const ownerID = data2.Item.owner;
        console.log(ownerID);
        getUserEmail(ownerID)
        .then((data3) => {
          const ownerEmail = data3.Items[0].email;
          console.log(ownerEmail);
          addNotif(ownerEmail, {type:"group-request", groupID: groupID, group: data2.Item.title});

          res.send("OK OK");
        })
      })
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("WHAWAWI");
    })
  })
  .catch((err) => {
    console.log(err);
    res.status(500).send("whadwowa");
  })
})

router.post("/api/getGroupName", (req, res) => {
  const groupID = req.body.groupID;

  getGroupName(groupID)
  .then((data) => {
    res.send(data.Item.title)
  })
  .catch((err) => {
    console.log(err);
    res.status(500).send("NOOOO");
  })
})

router.post("/api/getOwnedGroups", (req, res) => {
  const email = req.body.email;

  getUserInfo(email)
  .then((data) => {
    res.send(data.Item.ownedGroups);
  })
  .catch((err) => {
    console.log(err);
    res.send({});
  })
})

// Search groups

router.post("/api/searchGroups", (req, res) => {
  let groups = [];
  docClient.scan({
      TableName: "Groups",
  }).promise()
  .then((response) => {
      for (let i = 0; i < response.Count; i++) {
          groups.push([response.Items[i].id, response.Items[i].title]);
      }
      res.send(groups);
  })
  .catch((err) => {
      console.log(err);
      res.status(500).send(err);
  })
})

// End of search groups

export default router;