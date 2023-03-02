require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')


const app = express()

app.use(cors({
    credentials: true,
    origin: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cookieParser())


// Routes
app.use('/auth', require('./routes/authRoute'))

const URI = process.env.MONGODB_URL
mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err) => {
    if (err) throw err
    console.log(`Connected to MongoDB`)

})


const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
