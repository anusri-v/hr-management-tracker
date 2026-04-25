const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500']
}))
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hello from Express')
})

app.get('/people', (req, res) => {
    res.json([
        { id: 1, name: 'Anusri' },
        { id: 2, name: 'Rakesh'}
    ])
})

app.get('/message', (req, res) => {
    res.json({ message: "Hello from the express server" })
})

app.post('/message', (req, res) => {
    const { name, message } = req.body

    console.log('New message: ', name, message)
    res.json({ message: "Thank you for reaching out!!" })
})

app.listen(3000, () => {
    console.log('The server is running');
})