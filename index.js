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
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const projectsCollection = client.db('projectile').collection('projects')
    const feedbackCollection = client.db('projectile').collection('feedback')
    try {
        //api endpoints

        //signup
        app.post('/signup', async (req, res) => {
            const user = req.body
            const { email, userName, password, profileImg } = user
            const existedUser = await userCollection.findOne({ userName: userName })

            // console.log(typeof (existedUser));
            if (!existedUser) {
                const hashedPassword = await bcrypt.hash(password, 10)
                const result = await userCollection.insertOne({ email, userName, hashedPassword, profileImg })
                const responseMesssage = {
                    message: 'SignUp Successful'
                }
                res.send(responseMesssage)
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

        //login
        app.post('/login', async (req, res) => {
            const loginInfo = req.body
            let { email, password } = loginInfo
            let existedUser = await userCollection.findOne({ email: email })

            //setting the response message for login request
            let responseMesssage = {
                message: 'Login Failed'
            }
            if (!existedUser) {
                responseMesssage.message = "No user found on DB"
                res.send(responseMesssage)
                return
            }
            if (existedUser) {
                const isPasswordmatched = await bcrypt.compare(password, existedUser.hashedPassword).then(result => {
                    if (result) {
                        // responseMesssage.message = "Login Successful"
                        // res.send(responseMesssage)
                        res.send(existedUser)
                    }
                    else {
                        responseMesssage.message = "Incorrect Password"
                        res.send(responseMesssage)
                    }
                })
            }
        })

        // get all users
        app.get('/users', async (req, res) => {
            // const query = { email: "demo@gmail.com" }
            const users = await userCollection.find().toArray()
            res.send(users)
        })

        // add prpject
        app.post('/projects', async (req, res) => {
            const project = req.body
            const result = await projectsCollection.insertOne(project)
            res.send(result)
        })
        // get all projects
        app.get('/projects', async (req, res) => {
            const userEmail = req?.query.email
            if (userEmail) {
                const query = {
                    creator: userEmail
                }
                const projects = await projectsCollection.find(query).toArray()
                res.send(projects)
            } else {
                const projects = await projectsCollection.find().toArray()
                res.send(projects)
            }
        })
        //get project by id
        app.get('/projects/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const project = await projectsCollection.findOne(query)
            res.send(project)
        })

        // add feedback
        app.post('/feedback', async (req, res) => {
            const feedback = req.body
            const result = await feedbackCollection.insertOne(feedback)
            res.send(result)
        })
        // get all feedback
        app.get('/feedbacks', async (req, res) => {
            const query = {}
            const result = await feedbackCollection.find(query).toArray()
            res.send(result)
        })

    } finally {

    }
}
run().catch(console.dir)
app.listen(port, () => {
    console.log(`This app is running on http://localhost:${port}`);
})


