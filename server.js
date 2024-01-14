const express = require('express'),
      User = require('./user'),
      fs = require('fs'),
      mongoose = require('mongoose'),
      dotenv = require('dotenv'),
      path = require('path'),
      crypto = require('crypto'),
      cors = require('cors');

dotenv.config();
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '10mb' }));

app.use(express.json())
   .use('/static', express.static(path.join(__dirname, 'assets')))
   .use(cors());

mongoose.connect(process.env.DATABASE_URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
     console.log('Connected to MongoDB');
});

let messages = [];
const PORT = process.env.PORT || 8080; 
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

io = require('socket.io')(server, {
    cors: {
        origin: "*"
    },
})

io.on('connection', (socket) => {
    socket.on('message', (data) => {
        console.log(`User ${data.user} connected`);
        console.log(data.message);
        console.log(`Profile Image URL: ${data.profileImage}`);
        messages.push(data);
        io.emit('message', data); 
    });
});

const endpoints = {
    thumbnail: "https://thumbnails.roblox.com",
    userInfo: "https://users.roblox.com"
}

const waitingForVertification = {}
const words = ["word", "cup", "tea", "sea", "water", "sail", "boat", "tail", "plant", "sand"]

const tokenGenerator = () => {
    return crypto.randomBytes(16).toString("hex")
}

const codeGenerator = () => {
    const randomWords = [];
    for (let i = 0; i < 15; i++) {
        const randomIndex = Math.floor(Math.random() * words.length);
        randomWords.push(words[randomIndex]);
    }
    return randomWords.join(' ');
}
const getIdFromName = async username => {
    const robloxUserInfo = await fetch(`${endpoints.userInfo}/v1/usernames/users`, {
        method: "POST",
        body: JSON.stringify({
            usernames: [username],
            excludeBannedUsers: true
        })
    });

    const parsedUserInfo = await robloxUserInfo.json()
    if (parsedUserInfo.data.length < 1) {
        return
    }

    const userData = parsedUserInfo.data[0]
    return userData.id
}

const userDescription = async (robloxId) => {
    const userDescription = await fetch(`https://users.roblox.com/v1/users/${robloxId}`)
    const userDescriptionData = await userDescription.json()
    return userDescriptionData.description
}


const getPfpUrl = async userId => {
    const params = new URLSearchParams({
        userIds: userId,
        size: "100x100",
        format: "Png",
        isCircular: true
    })
    const userProfile = await fetch(`${endpoints.thumbnail}/v1/users/avatar-headshot?${params}`)
    const parsed = await userProfile.json()
    if (parsed.data.length < 1) {
        throw new Error("Unknown user id")
    }
    return parsed.data[0].imageUrl
}

app.get('/messages', async (request, response) => {
    try {
        response.json(messages);
    } catch (error) {
        response.status(500).send('Error retrieving messages');
    }
})

app.post('/verify', async (request, response) => {
    const { username } = request.body
    const robloxId = await getIdFromName(username)
    const token = tokenGenerator()
    const code = waitingForVertification[username]
    const pfpUrl = await getPfpUrl(robloxId);

    const aboutMe = await userDescription(robloxId)
    console.log("robloxdes:", aboutMe)
    console.log(`pfpUrl ${pfpUrl}`)

    if (aboutMe !== code) {
        response.status(500).send("Code doesn't match!")
        return
    }

    delete waitingForVertification[username]

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        response.send({
            token: existingUser.token,
            pfpUrl,
            robloxId,
            username,
            isNew: false
        })

        return
    }

    const newUser = new User({
        username,
        token
    });
    
    newUser.save()
    response.send({token, pfpUrl, robloxId, username, isNew: true })
})

app.post("/userInfo", async (request, response) => {
    const robloxId = await getIdFromName(request.body.username)
    response.json({
        userId: robloxId
    })
})

app.get('/inventory', async (request, response) => {
    const inventory = [];
    response.json({
        inventory: inventory
    });
});

app.post("/code", async (request, response) => {
    const { username } = request.body
    const code = codeGenerator()
    waitingForVertification[username] = code
    response.json({
        code: code
    })
})

app.post("/data", async (request, response) => {
    const data = request.body;
    console.log('Received data:', data);

    response.send("got\n")
})


app.get("/username", (request, response) => {
    const token = request.header("token")

    console.log(token)
})

app.get("/", (req, res) => {
    res.send("GET OUT");
  });
