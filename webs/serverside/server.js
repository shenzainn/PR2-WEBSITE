
const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('index');
})

const port = 3000;
app.listen(port, ( ) => { 
    console.log(`Server is running on port ${port}`);
});