import { number, string } from "prop-types"

let User = {
    username: string,
    email: string,
    password: string,
    friends: [],
    events: ["hash id"],
    directMessages: [],
    groups: [],
    pfp: ":)",
}

let Group = {
    name: string,
    id: string,
    location: string,
    description: string,
    tags: [],
    admins: [],
    members: [],
    events: [],
    icon: ":()"
}

let Event = {
    name: string,
    id: string,
    location: string,
    description: string,
    tags: [],
    admins: [],
    participants: [],
    particpantLimit: number,
    icon: ":P"
}