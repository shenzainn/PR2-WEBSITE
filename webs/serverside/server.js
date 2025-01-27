
const express = require('express');
const path = require('path');
const app = express();


app.use(express.json());
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, '../public')));

const studentRouter = require('./routes/students')
app.use('/students', studentRouter);

const adminRouter = require('./routes/admin')
app.use('/admin', adminRouter);

app.get('/', (req, res) => {
    const portNum = process.env.port || 3000;
    const localIP = 'insert IP';
    res.render('index', {portNum, localIP });
})

const port = process.env.port || 3000;
app.listen(port, ( ) => { 
    console.log(`Server is running on port ${port}`);
});