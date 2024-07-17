const express = require('express');
const app = express()
const cors = require('cors')
require('dotenv').config()
const dbConnect = require('./config/dbConnect')
const userRouter = require("./routes/userRoutes")
const tutorRouter = require("./routes/tutorRoutes")
const adminRouter = require("./routes/adminRoutes")
const socketapi = require('./socket/socketapi');


app.use(express.json())
dbConnect()

app.use(cors({
    origin:process.env.CLIENT_URL,
    credentials: true
}))

app.use("/", userRouter)
app.use("/tutor", tutorRouter)
app.use("/admin", adminRouter)

//error handlers
app.use((err, req, res, next) => {
    console.error(err.stack)
})

const PORT = process.env.PORT || 3001

//create server
const server = app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
})

//connection socket io
socketapi.io.attach(server, {
    cors: {
        origin: '*'
    }
});
