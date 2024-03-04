const express = require('express')
const app = express()
const cors = require('cors')
const bcrypt = require('bcrypt')
const port = process.env.PORT || 5000
require('dotenv').config()
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('server is running')
})
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mtnbd39.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    // collections
    const userCollection = client.db('projectile').collection('users')
    try {
        //api endpoints
        app.post('/signup', async (req, res) => {
            const user = req.body
            const { email, userName, password, profileImg } = user
            const existedUser = await userCollection.findOne({ userName: userName })

            // console.log(typeof (existedUser));
            if (!existedUser) {
                const hashedPassword = await bcrypt.hash(password, 10)
                const result = await userCollection.insertOne({ email, userName, hashedPassword, profileImg })
                res.send(result)
                return
            }
            else if (email === existedUser.email || userName === existedUser.userName) {
                const responseMesssage = {
                    message: 'Duplicate username/email'
                }
                res.send(responseMesssage)
                return
            }
        })

    } finally {

    }
}
run().catch(console.dir)
app.listen(port, () => {
    console.log(`This app is running on http://localhost:${port}`);
})


