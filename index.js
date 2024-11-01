const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors());
app.use(express.static('public'));
app.use(express.json());  // Permite analizar JSON en solicitudes
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let users = [];
let exercises = [];

app.get('/api/users',(req,res)=>{
   res.json(users)
})

app.post('/api/users',(req,res)=>{
  const {username} = req.body;
  const user = {username,
    _id : new Date().getTime().toString()
  };
  users.push(user);
  res.json(user);
})

app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  const user = users.find(user => user._id === _id);
  if (!user) {
    return res.json({ error: 'User not found' });
  }

  const exercise = {
    username: user.username,
    description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString(),
    _id: _id
  };

  exercises.push(exercise);
  res.json(exercise);
});

app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const user = users.find(user => user._id === _id);
  if (!user) {
    return res.json({ error: 'User not found' });
  }

  let log = exercises.filter(exercise => exercise._id === _id);

  if (from) {
    const fromDate = new Date(from);
    log = log.filter(exercise => new Date(exercise.date) >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    log = log.filter(exercise => new Date(exercise.date) <= toDate);
  }

  if (limit) {
    log = log.slice(0, limit);
  }

  res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    log
  });
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
