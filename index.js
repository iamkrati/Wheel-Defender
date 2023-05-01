if (process.env.NODE_ENV != "production") {
    require("dotenv").config({ path: "./config.env" })
} 

const express = require('express');
const app = express();
const path = require('path');


const fetch = require('node-fetch');
const { Headers } = fetch;

const alert = require('alert')



const mongoose = require('mongoose');

const Driver = require('./models/driver.js')
const Driverchallan = require('./models/driverchallan.js')

const dburl = process.env.DB_URI

mongoose.connect(dburl)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.log(err));



const headers = {
    "accept": "application/json",
    "accept-encoding": "gzip, deflate",
    "content-type": "application/json",
    "clientId": process.env.clientId,
    "secretKey": process.env.secretKey
};

var raw = JSON.stringify({
    "number": "UP81 20210024690",
    "dob": "28/10/2002"
});

var requestOptions = {
    method: 'POST',
    headers: headers,
    body: raw,
    redirect: 'follow'
};


const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));

const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate);

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/login', (req, res) => {
    res.render('login');
})
app.post('/login', async (req, res) => {

    console.log(req.body)
    const { DLNO } = req.body;
    const check=await Driver.findOne({DLNO:`${DLNO}`});
    if(check==null)
    {
        alert("You are NOT registerd YET");
        res.redirect('/login')
    }
    else
    {
        const data=JSON.parse(check.results)
        const chlans=(await check.populate('challans')).challans;
        res.render('DriverProfile',{data : data.result,challans:chlans})
    }
    

})
app.post('/signup', async (req, res) => {

    console.log(req.body)
    const { DLNO, DOB, number } = req.body;
    const check=await Driver.findOne({DLNO:`${DLNO}`});
    console.log(check)
    if(check==null)
    {
        var raw = JSON.stringify({
            "number": `${DLNO}`,
            "dob": `${DOB}`
        });
        var requestOptions = {
            method: 'POST',
            headers: headers,
            body: raw,
            redirect: 'follow'
        };
         fetch("https://api.emptra.com/drivingLicenceV2", requestOptions)
            .then(response => response.text())
            .then(results => {
                const data=JSON.parse(results);
                console.log(results);
                console.log(data);
                if (data.results == "undefined" ) {
                    alert('Entered incorrect information')
                    res.redirect('/login');
                }
                else {
                    Driver.create({ DLNO, results}).then(()=>{
                        res.render('DriverProfile', { data: data.result });
                    })
                    
                }
            })
            .catch(error => console.log('error', error));
    }
    else
    {
        alert("You are already registerd");
        res.redirect('/login')
    }
    

})

app.get('/driver', (req, res) => {

    // fetch("https://api.emptra.com/drivingLicenceV2", requestOptions)
    //     .then(response => response.text())
    //     .then(results => {
    //         const data=JSON.parse(results);
    //         console.log(results);
    //         console.log(data);
    //         const name = data.result.detailsOfDrivingLicence.name
    //         const imgurl = data.result.detailsOfDrivingLicence.photo;
    //         res.render('DriverProfile', { data: data.result });
    //     })
    //     .catch(error => console.log('error', error));

    res.render('DriverProfile');
});




app.get('/option', (req, res) => {
    res.render('options');
})


app.get('/tplogin', (req, res) => {
    res.render('tplogin')
})


app.get('/policedept', (req, res) => {
    res.render('TrafficPolice')
})

app.post('/policedept', (req, res) => {
    res.render('TrafficPolice');
})


app.get('/echalan', (req, res) => {
    res.render('EChallan');
})

app.get('/report',(req,res)=>{
    res.render('Report')
})

app.get('/vlogin',(req,res)=>{
    res.render('vlogin');
})

app.get('/vowner',(req,res)=>{
    res.render('Vehicle');
})

app.post('/vowner',(req,res)=>{
    res.render('Vehicle');
})

app.post('/echalan', (req, res) => {

    console.log(req.body);
    const { dname, vno , reason, amount, comment } = req.body;
    alert("Challan registered");
    var sid = process.env.sid
    var authtoken = process.env.authtoken
    var twilio = require('twilio')(sid, authtoken);
    twilio.messages.create({
        from: "+15076326379",
        to: "+917300696475",
        body: `\nName:${dname}\nVehicleNO:${vno}\nReason:${reason}\nAmout:${amount}\nComment:${comment}`
    })
        .then(() => {
            console.log("message sent");
        })

    res.redirect('/echalan');
})

app.post('/report', async(req, res) => {

    console.log(req.body);
    const { dname, DLno , reason, comment } = req.body;
    alert("Challan registered");
    var sid = 'AC4ee3d96219284f0c7242f35bc1e0bec1'
    var authtoken = 'a8cb0db1400cabf65fcafcc9998c99ed'
    var twilio = require('twilio')(sid, authtoken);
    twilio.messages.create({
        from: "+15076326379",
        to: "+917300696475",
        body: `\nName:${dname}\nDrivingNO:${DLno}\nReason:${reason}\nComment:${comment}`
    })
        .then(() => {
            console.log("message sent");
        })

    const dchallan=new Driverchallan({reason: `${reason}`});
    await dchallan.save();

    const finddriver=await Driver.findOne({DLNO: `${DLno}`});

    console.log(finddriver)    
    finddriver.challans.push(dchallan);
    // const fdriver=JSON.parse(finddriver);

    const updriver=new Driver(finddriver);
    updriver.save();
    res.redirect('/report');
})

const port=process.env.PORT ;
app.listen(port, () => {
    console.log(`server running at port 3000`);
})














