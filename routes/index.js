const { json } = require('body-parser');
var express = require('express');
var router = express.Router()
var sql = require('mssql');
const { request } = require('../app');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//Azure sql server and sql database configuration
var config = {

  user: "admin1",
  password: "Abcd0000!",
  server: "databasess.database.windows.net",
  port: 1433,
  database: "testdb",
  connectionTimeout: 30000,
  parseJSON: true,
  options: {
    encrypt: true,
    enableArithAbort: true
  },
  pool: {
    min: 0,
    idleTimeoutMillis: 30000
  }

};

//auto define progress percentage based on status and current date 
function workProgress(st,ddl,status) {
  var  timeElapsed = Date.now();
  var workPercent = 100;
  switch (status) {
    case 'inProcess':
      workPercent=Math.round(Math.abs((ddl-timeElapsed)/(ddl-st)))*100;
      return workPercent;
      break;
    case 'notStart':
      workPercent=0;
      return workPercent;
      break;
    // case 'delayed':
    //   workPercent=99;
    //   return workPercent;
    //   break;
    default:
      workPercent=100;
      return workPercent;
  }
}

//get whole records from SQL database
async function getAllData() {
  try {
    let conn = await sql.connect(config)
    let getData =  await conn.request()
       .execute('getAll')
      console.log('get all data')    
      return getData.recordsets;
  }
  catch (err) {
      console.log(err);
  }

}

//add a new record 
async function addNew(record) {

  try {
    let conn = await sql.connect(config)
    let insertRow =  await conn.request()
      .input('API', sql.NVarChar, record.API)
      .input('Owner', sql.NVarChar, record.Owner)
      .input('Group', sql.NVarChar, record.Group)
      .input('Priority', sql.NVarChar, record.Priority)
      .input('StartFrom', sql.DateTime, record.StartFrom)
      .input('Deadline', sql.DateTime, record.Deadline)
      .input('Process', sql.Int, record.Process)
      .input('Status', sql.NVarChar, record.Status)
      .input('Comments', sql.NVarChar, record.Comments)
      .input('Duration', sql.NVarChar, record.Duration)
      .input('createAt', sql.DateTime, record.createAt)
      .input('updateAt', sql.DateTime, record.updateAt)
      .execute('InsertNew').then(result => console.log('insertNew',result))

      return insertRow;
  }
  catch (err) {
      console.log(err);
  }

}

//update a record
async function updateRow(record) {
  try {
    console.log('this record',record)
    let conn = await sql.connect(config)
    let updateRec =  await conn.request()
      .input('ID',sql.Int,record.ID)
      .input('API', sql.NVarChar, record.API)
      .input('Owner', sql.NVarChar, record.Owner)
      .input('Group', sql.NVarChar, record.Group)
      .input('Priority', sql.NVarChar, record.Priority)
      .input('StartFrom', sql.DateTime, record.StartFrom)
      .input('Deadline', sql.DateTime, record.Deadline)
      .input('Process', sql.Int, record.Process)
      .input('Status', sql.NVarChar, record.Status)
      .input('Comments', sql.NVarChar, record.Comments)
      .input('Duration', sql.NVarChar, record.Duration)
      .input('createAt', sql.DateTime, record.createAt)
      .input('updateAt', sql.DateTime, record.updateAt)
      .execute('updateRecords').then(record => console.log('updateRecords',record));
      return updateRec;
  }
  catch (err) {
      console.log(err);
  }

}

router.get('/showAll', function(req,res) {
  getAllData().then((data) => {
    res.send(JSON.stringify(data))
  })
});

//add a new record
router.post('/add', function(req, res) {
  console.log('route db req body',req.body)
  var ddl= new Date(req.body.Deadline).getTime()
  var st = new Date(req.body.StartFrom).getTime()
  var oneDay = 1000*60*60*24
  var diff = Math.round((ddl - st)/oneDay)
  var current = Date.now()
  var record = {
    ID:req.body.ID,
    API: req.body.API,
    Owner: req.body.Owner,
    Group: req.body.Group,
    Priority: req.body.Priority,
    StartFrom:req.body.StartFrom,
    Deadline:req.body.Deadline,
    Process:workProgress(st,ddl,req.body.Status),
    Status:req.body.Status,
    Comments:req.body.Comments,
    Duration: diff,
    createAt:new Date(current),
    updateAt:new Date(current)
  };

  addNew(record).then(data => {
    res.send(JSON.stringify(record))

  })
});

//update an existing record
router.post('/update', function(req, res) {
  var current = Date.now()
  var ddl= new Date(req.body.Deadline).getTime()
  var st = new Date(req.body.StartFrom).getTime()
  var oneDay = 1000*60*60*24
  var diff = Math.round((ddl - st)/oneDay)

  var record = {
    ID:req.body.ID,
    API: req.body.API,
    Owner: req.body.Owner,
    Group: req.body.Group,
    Priority: req.body.Priority,
    StartFrom:req.body.StartFrom,
    Deadline:req.body.Deadline,
    Process:workProgress(st,ddl,req.body.Status),
    Status:req.body.Status,
    Comments:req.body.Comments,
    Duration:diff,
    createAt:req.body.createAt,
    updateAt:new Date(current)
  };

  updateRow(record).then(data => {
    res.send(JSON.stringify(record))
  })
});


module.exports = router;
