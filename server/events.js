import { v4 as uuidv4 } from 'uuid';
import express from 'express';
import { docClient, S3 } from './config.js';
import multer from 'multer';
const router = express.Router();
const upload = multer();

// Create event

function getStandardTime(time) {
  const hour = time.split(':')[0];
  const minutes = time.split(':')[1];
  if (parseInt(hour) < 12){
    return parseInt(hour) === 0 ? `12:${minutes} AM` : `${time} AM`;
  }
  else{
    return parseInt(hour) === 12 ? `12:${minutes} PM` : `${parseInt(hour)-12}:${minutes} PM`;
  }
}

function AddGroupEvent(groupID, eventID)
{
  var params = {
    TableName: "Groups",
    Key: {id: groupID},
    UpdateExpression: "SET events.#e = :n",
    ExpressionAttributeNames: {"#e": eventID},
    ExpressionAttributeValues: {":n": null}
  }

  return docClient.update(params).promise();
}

router.post("/api/createEvent", (req, res) => {
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
      TableName : 'Events',
      Item: {
        id: id,
        title: req.body.title,
        desc: req.body.desc,
        location: req.body.location,
        startTime: getStandardTime(req.body.startTime),
        endTime: getStandardTime(req.body.endTime),
        date: req.body.date,
        participants: req.body.participants,
        totalSlots: req.body.totalSlots,
        owner: req.body.owner,
        coords: req.body.coords,
        accessType: req.body.accessType,
        group: req.body.group
      }
    };

    docClient.put(params).promise()
    .then((_) => {
      if(req.body.group !== "")
      {
        AddGroupEvent(req.body.group, id)
        .then((_) => {
          console.log("event created");
          res.send(id);
        })
        .catch((err) => {
          console.log(err);
          res.send("");
        })
      }
      else
      {
        console.log("event created");
        res.send(id);
      }
    })
    .catch((err) => {
      console.error(err);
      res.send(err);
    })

    let events = data.Item.events;
    (events === undefined || events === null) ? events = (id + ',') : events += (id + ',');
    var params = {
      TableName: 'Users',
      Key: {
        email: req.body.email,
      },
      UpdateExpression: 'SET events = :events',
      ExpressionAttributeValues: {
        ":events": events,
      }
    };
    docClient.update(params).promise();
  })
  .catch((err) => {
    console.error(err);
    res.send(err);
  })
});

// End of create event

//Delete Event
router.post("/api/deleteEvent", (req, res) => {
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
      let events = data.Item.events;

      if (events.includes(id+',')) {
        console.log("Event ID located for deletion");
        events = events.replace(id+',', '');
        var params = {
          TableName: 'Users',
          Key: {
            email: email,
          },
          UpdateExpression: 'SET events = :events',
          ExpressionAttributeValues: {
            ":events": events,
          },
        };
        docClient.update(params).promise()
        .then(() => {
          console.log("Event successfully removed from event list of user");
          var params = {
            Key: {
              id: id
            },
            TableName: "Events"
          }
          docClient.delete(params, function(err, data){
            if(err) res.send(err);
            else res.send(data);
          });
        })
      }
      else {
        console.log(`Event ID ${id} not found in event list of user`);
      }
    })
})
// Grab event owner

router.post("/api/grabEventOwner", (req, res) => {
  getEventByID(req.body.id)
  .then((event) => {
    let userID = event.Item.owner;
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

// End of grab event owner

// Grab events

const GetUserGroups = (userEmail) => {
  var params = {
      TableName: 'Users',
      Key: {
          email: userEmail,
      },
      AttributesToGet: ["groups"]
  }

  return docClient.get(params).promise();
};

const getGroupByID = (groupID) => {
  var params = {
    TableName: 'Groups',
    Key: {
      id: groupID,
    }
  }

  return docClient.get(params).promise();
};

router.post("/api/getGroupEvents", (req, res) => {
  const email = req.body.email;

  GetUserGroups(email)
  .then((data) => {
    if (data.Item.groups !== undefined && data.Item.groups !== null && data.Item.groups.length > 1) {
      let groups = data.Item.groups.split(',');
      groups.pop();  //removes null string that comes at end from split()

      let groupEvents = [];
      let promises = [];
      groups.forEach((gk) => {
        let promise = getGroupByID(gk)
        .then((data) => {
          Object.keys(data.Item.events).forEach((ek) => {
            groupEvents.push(ek);
          })
        })
        .catch((err) => {
          console.log(err);
        });

        promises.push(promise);
      })

      Promise.allSettled(promises)
      .then((results) => {
        let events = [];
        promises = [];
        groupEvents.forEach((ek) => {
          let promise = getEventByID(ek)
          .then((data) => {
            events.push(data.Item);
          })
          .catch((err) => {console.log(err)})

          promises.push(promise);
        })

        Promise.allSettled(promises)
        .then((results) => {
          res.send(events);
        })
      })
    }
    else {
      console.log("user has no groups");
      res.send([]);
    }
  })
  .catch((err) => {
    console.log(err);
    res.send([]);
  })
})

router.post("/api/grabPubEvents", (req, res) => {
  var params = {
    TableName: 'Events',
    FilterExpression: "accessType = :t",
    ExpressionAttributeValues: {":t": "Public"}
  }

  docClient.scan(params).promise()
    .then((data) => {
      console.log("pub events sent");
      res.send(data.Items);
    })
    .catch((err) => {
      console.error(err);
      res.send(err);
    });
});

async function eventForWrap(event_array, events) {
  try {
    for (let i = 0; i < event_array.length; i++) {
      var params = {
        TableName: 'Events',
        Key: {
          id: event_array[i],
        }
      };

      await docClient.get(params).promise()
      .then((data) => {
        events.push(data);
      })
    };
    
    return events;
  } catch(err) {
    console.error(err);
    throw err;
  }
}

router.post("/api/grabPrivEvents", (req, res) => {
  var params = {
    TableName: 'Users',
    Key: {
      email: req.body.email,
    }
  }
  let events = [];

  docClient.get(params, function (err, data) {
    if (err) res.send(err);
    else {
      if (data.Item.events !== undefined && data.Item.events !== null && data.Item.events.length > 1) {
        let event_array = data.Item.events.split(',');
        event_array.pop();  //removes null string that comes at end from split()

        eventForWrap(event_array, events)
        .then((data) => {
          console.log("priv events sent");
          res.send(data);
        })
        .catch((err) => {
          res.send(err);
          console.error(err);
        })
      } else {
        console.log("user has no events");
        res.send([]);
      }
    }
  })
});

// End of grab events

// Is event owner

router.post("/api/isEventOwner", (req, res) => {
  getEventByID(req.body.id)
  .then((event) => {
    let eventUserID = event.Item.owner;
    var params = {
      TableName: 'Users',
      Key: {
        email: req.body.email,
      }
    }
  
    docClient.get(params).promise()
    .then((user) => {
      if (user.Item.userID === eventUserID) {
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

// End of is event owner

// Get event by ID

const getEventByID = (eventID) => {
  var params = {
    TableName: 'Events',
    Key: {
      id: eventID,
    }
  }

  return docClient.get(params).promise();
};

router.post("/api/getEvent", (req, res) => {
  getEventByID(req.body.eventID)
    .then((data) => {
      console.log("Event sent successfully");
      res.send(data);
    })
    .catch((err) => {
      console.error(err);
      res.send(err);
    });
});

// End of get event by ID

// Join Event

router.post("/api/joinEvent", (req, res) => {
  console.log("joining event...");
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
      let events = data.Item.events;
      let userID = data.Item.userID;

      if (events === undefined || events === null || !events.includes(id)) {
        if (events === ',') {
          events = (id + ',');
        } else {
          (events === undefined || events === null) ? events = (id + ',') : events += (id + ',');
        }
        var params = {
          TableName: 'Users',
          Key: {
            email: email,
          },
          UpdateExpression: 'SET events = :events',
          ExpressionAttributeValues: {
            ":events": events,
          },
        };
        docClient.update(params).promise()   //add event to user
          .then((_) => {
            console.log("event added to user")
            getEventByID(id)  //get event
              .then((data) => {
                let participants = data.Item.participants
                participants.push(userID);
                var params = {
                  TableName: 'Events',
                  Key: {
                    id: id,
                  },
                  UpdateExpression: 'SET participants = :participants',
                  ExpressionAttributeValues: {
                    ":participants": participants,
                  },
                };
                docClient.update(params, function(err, data) {  //increment event participants
                  if (err) {
                    console.error(err);
                    res.send(err);
                  } else {
                    console.log("Event joined successfully");
                    res.send("Event joined");
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
        console.error("User already joined event");
        res.send("User already joined event");
      }
    })
    .catch((err) => {
      console.error(err);
      res.send(err);
    })
});

// End of join event

// Leave event of by email

router.post("/api/leaveEvent", (req, res) => {
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
      RemoveParticipant(id, email, data.Item.userID, data.Item.events, res);
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    })
});

// End of leave event by email

// Remove participant

router.post("/api/removeParticipant", (req, res) => {
  const userID = req.body.participant;
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
    RemoveParticipant(id, data.Items[0].email, userID, data.Items[0].events, res);
  })
  .catch((err) => {
    console.log(err);
    res.send(err);
  })
});

// End of remove participant

// Remove participant function

const RemoveParticipant = (id, email, userID, events, res) => {
  if (events.includes(id+',')) {
    events = events.replace(id+',', '');
    var params = {
      TableName: 'Users',
      Key: {
        email: email,
      },
      UpdateExpression: 'SET events = :events',
      ExpressionAttributeValues: {
        ":events": events,
      },
    };
    docClient.update(params).promise()   //remove event from user
      .then((_) => {
        getEventByID(id)  //get event
          .then((data) => {
            let participants = data.Item.participants
            let idx = participants.indexOf(userID);
            if (idx !== -1) {participants.splice(idx, 1);}

            var params = {
              TableName: 'Events',
              Key: {
                id: id,
              },
              UpdateExpression: 'SET participants = :participants',
              ExpressionAttributeValues: {
                ":participants": participants,
              },
            };
            docClient.update(params, function(err, data) {  //decrement event participants
              if (err) {
                console.error(err);
                res.send(err);
              } else {
                console.log("Event left successfully");
                res.send("Event left");
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
    console.error("User not part of event");
    res.send("User not part of event");
  }
}

// End of remove participant function

// Update event

router.post("/api/updateEvent", (req, res) => {
  var params = {
    TableName: 'Events',
    Key: {
      id: req.body.id,
    },
    UpdateExpression: `SET #title = :title, #desc = :desc, #date = :date, #endTime = :endTime, 
    #location = :location, #participants = :participants, 
    #startTime = :startTime, #totalSlots = :totalSlots`,
    ExpressionAttributeNames: {
      '#title': "title",
      '#desc': "desc",
      '#date': "date",
      '#endTime': "endTime",
      '#location': "location",
      '#participants': "participants",
      '#startTime': "startTime",
      '#totalSlots': "totalSlots",
    },
    ExpressionAttributeValues: {
      ":title": req.body.title,
      ":desc": req.body.desc,
      ":date": req.body.date,
      ":endTime": req.body.endTime,
      ":location": req.body.location,
      ":participants": req.body.participants,
      ":startTime": req.body.startTime,
      ":totalSlots": req.body.totalSlots,
    }
  };

  docClient.update(params).promise()
  .then((_) => {
    console.log("event updated");
    res.send([]);
  })
  .catch((err) => {
    console.log(err);
    res.send(err);
  })
})

// End of update event

// Update participants names

async function participantForWrap(participantIDs, participantNames) {
  try {
    for (let i = 0; i < participantIDs.length; i++) {
      var params = {
        TableName: 'Users',
        IndexName: 'userID-index',
        KeyConditionExpression: '#userID = :v_userID',
        ExpressionAttributeNames: {
          '#userID': 'userID'
        },
        ExpressionAttributeValues: {
          ':v_userID': participantIDs[i]
        }
      }
  
      await docClient.query(params).promise()
      .then((data) => {
        let participantTuple = [participantIDs[i], data.Items[0].username];
        participantNames.push(participantTuple);
      })
    };
    
    return participantNames;
  } catch(err) {
    console.error(err);
    throw err;
  }
}

router.post("/api/participantNames", (req, res) => {
  let participantIDs = req.body.participants;
  if (participantIDs === [] || participantIDs === undefined || participantIDs === null) {
    res.send([])
  } else {
    let participantNames = [];
    participantForWrap(participantIDs, participantNames)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err);
    })
  }
})

// End of update participants names

// Upload event banner

router.post("/api/uploadEventBanner", upload.single('banner'), (req, res) => {
  const file = req.file;
    const id = req.body.id;

    S3.upload({
        Bucket: 'ctat-event-banner',
        Key: id,
        Body: file.buffer
    }).promise()
    .then((_) => {
        console.log('event banner updated');
        res.send('event banner updated');
    }).catch((err) => {
        console.log(err);
        res.status(500).send(err);
    })
})

// End of upload event banner

// Get event banner

router.post("/api/getEventBanner", (req, res) => {
  const id = req.body.id;

  S3.getSignedUrlPromise('getObject', {
    Bucket: 'ctat-event-banner',
    Key: id
  }).then((response) => {
    res.send(response);
  }).catch((err) => {
    console.log(err);
  })
})

// End of get event banner

// Search events

router.post("/api/searchEvents", (req, res) => {
  let events = [];
  docClient.scan({
      TableName: "Events",
  }).promise()
  .then((response) => {
      for (let i = 0; i < response.Count; i++) {
          events.push([response.Items[i].id, response.Items[i].title]);
      }
      res.send(events);
  })
  .catch((err) => {
      console.log(err);
      res.status(500).send(err);
  })
})

// End of search events

export default router;