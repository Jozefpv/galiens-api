const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const PORT = 3001

//Settings
app.set('port', process.env.PORT || 3001)


//middlewares
app.use(morgan('dev'))
app.use(express.json())
const corsOptions = {
    origin: 'https://galiens.xyz',
    optionsSuccessStatus: 200 
  };
  
app.use(cors(corsOptions));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

app.use(require('./routes/routes'))

app.listen(app.get('port'), () => { 
    console.log(`Server on port ${app.get('port')}`)

})