const http = require('http');
const portNumber = process.argv[2];
const httpSuccessStatus = 200;
const path = require("path");
const express = require("express"); /* Accessing express module */
const { response } = require('express');
const bodyParser = require("body-parser"); /* To handle post parameters */
const app = express(); /* app is a request handler function */

app.listen(portNumber);

app.use(express.static(__dirname + 'styles'));

require("dotenv").config({ path: path.resolve(__dirname, '.env') }) 

const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;

 /* Our database and collection */
 const databaseAndCollection = {db: "CMSC335DB", collection:"Courses"};

/****** DO NOT MODIFY FROM THIS POINT ONE ******/
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = `mongodb+srv://${userName}:${password}@cluster0.jwyxnnn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


//inserting an applicant
async function insertApplicant(client, databaseAndCollection, newApplicant) {
    const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(newApplicant);
}

//looking up applicant by email
async function lookUpCourse(client, databaseAndCollection, courseName) {
    let filter = {Name : courseName};
    const result = await client.db(databaseAndCollection.db)
                        .collection(databaseAndCollection.collection)
                        .findOne(filter);

    return result;
}

//retrieveing GPAs
async function lookUpGPA(client, databaseAndCollection, semester) {
    let filter = {Semester : semester};
    const cursor = client.db(databaseAndCollection.db)
    .collection(databaseAndCollection.collection)
    .find(filter);

    // Some Additional comparison query operators: $eq, $gt, $lt, $lte, $ne (not equal)
    // Full listing at https://www.mongodb.com/docs/manual/reference/operator/query-comparison/
    const matches = await cursor.toArray();
    let sum = 0, numCourses = 0, avg = 0;
    let result = `<table border='1'>
    <tr>
        <th>Course Name</th>
        <th>GPA</th>
    </tr>`
    matches.forEach(function(elem) {
        sum += Number(elem.GPA);
        numCourses += 1
        result += `<tr><td>${elem.Name}</td><td>${elem.GPA}</td></tr>`
    });
    avg = sum/numCourses;
    result += `<tr><td>Semester GPA</td><td>${avg}</td></tr>`
    result += `</table>`
    return result;
}

//retrieveing Grades
async function lookUpGrade(client, databaseAndCollection, grade) {
    let filter = {Grade : grade};
    const cursor = client.db(databaseAndCollection.db)
    .collection(databaseAndCollection.collection)
    .find(filter);

    // Some Additional comparison query operators: $eq, $gt, $lt, $lte, $ne (not equal)
    // Full listing at https://www.mongodb.com/docs/manual/reference/operator/query-comparison/
    const matches = await cursor.toArray();
    let result = `<table border='1'>
    <tr>
        <th>Course Name</th>
        <th>Professor</th>
    </tr>`
    matches.forEach(function(elem) {
        result += `<tr><td>${elem.Name}</td><td>${elem.Professor}</td></tr>`
    });
    result += `</table>`
    return result;
}

//retrieveing Professor Courses
async function lookUpProfessorCourse(client, databaseAndCollection, professor) {
    let filter = {Professor : professor};
    const cursor = client.db(databaseAndCollection.db)
    .collection(databaseAndCollection.collection)
    .find(filter);

    // Some Additional comparison query operators: $eq, $gt, $lt, $lte, $ne (not equal)
    // Full listing at https://www.mongodb.com/docs/manual/reference/operator/query-comparison/
    const matches = await cursor.toArray();
    let result = `<table border='1'>
    <tr>
        <th>Course Name</th>
        <th>Grade</th>
        <th>Semester</th>
    </tr>`
    matches.forEach(function(elem) {
        result += `<tr><td>${elem.Name}</td><td>${elem.Grade}</td><td>${elem.Semester}</td></tr>`
    });
    result += `</table>`
    return result;
}

//retrieveing Courses by Semester
async function lookUpCoursesSemester(client, databaseAndCollection, semester) {
    let filter = {Semester : semester};
    const cursor = client.db(databaseAndCollection.db)
    .collection(databaseAndCollection.collection)
    .find(filter);

    // Some Additional comparison query operators: $eq, $gt, $lt, $lte, $ne (not equal)
    // Full listing at https://www.mongodb.com/docs/manual/reference/operator/query-comparison/
    const matches = await cursor.toArray();
    let result = `<table border='1'>
    <tr>
        <th>Course Name</th>
        <th>Grade</th>
        <th>Professor</th>
    </tr>`
    matches.forEach(function(elem) {
        result += `<tr><td>${elem.Name}</td><td>${elem.Grade}</td><td>${elem.Professor}</td></tr>`
    });
    result += `</table>`
    return result;
}

//removing all applicants
async function removeApplicants() {
    await client.connect();
    const result = await client.db(databaseAndCollection.db)
    .collection(databaseAndCollection.collection)
    .deleteMany({});

    return result.deletedCount;
}

async function getAge(professor) {
    // Making an API call (request)
    // and getting the response back
    let api_url =`https://api.agify.io/?name=${professor}`;
    const response = await fetch(api_url);
 
    // Parsing it to JSON format
    const data = await response.json();
    return (data.age);
}


process.stdin.setEncoding("utf8");

console.log(`Web server started and running at http://localhost:${portNumber}`);
const prompt = `Stop to shutdown the server: `;
process.stdout.write(prompt);
process.stdin.on('readable', () => {  /* on equivalent to addEventListener */
	let dataInput = process.stdin.read();
	if (dataInput !== null) {
		let command = dataInput.trim();
		if (command === "stop") {
			console.log("Shutting down the server");
            process.exit(0);  /* exiting */
        } 
    }
});

/* directory where templates will reside */
app.set("views", path.resolve(__dirname, "templates"));
app.use(express.static(__dirname + '/style'));

/* view/templating engine */
app.set("view engine", "ejs");

app.get("/", (request, response) => {

  /* Generating the HTML */
  response.render("index");
});

app.get("/index", (request, response) => {

    /* Generating the HTML */
    response.render("index");
  });
  

app.get("/courseInput", (request, response) => {
    let path = `<form action="http://localhost:${portNumber}/processCourse" method="post">`;

    const variables = {
        path : path
    }
    /* Generating the HTML */
    response.render("courseForm", variables);
  });

  app.get("/reviewCourse", (request, response) => {

    let path = `<form action="http://localhost:${portNumber}/processReviewCourse" method="post">`

    const variables = {
        path : path
    }
    /* Generating the HTML */
    response.render("reviewCourse", variables);
  });

  app.get("/adminGPA", (request, response) => {

    let path = `<form action="http://localhost:${portNumber}/processAdminGPA" method="post">`;

    const variables = {
        path : path
    }

    /* Generating the HTML */
    response.render("gpaForm", variables);
  });

  app.get("/adminGrade", (request, response) => {

    let path = `<form action="http://localhost:${portNumber}/processAdminGrade" method="post">`;

    const variables = {
        path : path
    }

    /* Generating the HTML */
    response.render("gradeForm", variables);
  });

  app.get("/adminProfessor", (request, response) => {

    let path = `<form action="http://localhost:${portNumber}/processAdminProfessor" method="post">`;

    const variables = {
        path : path
    }

    /* Generating the HTML */
    response.render("professorForm", variables);
  });

  app.get("/adminSemester", (request, response) => {

    let path = `<form action="http://localhost:${portNumber}/processAdminSemester" method="post">`;

    const variables = {
        path : path
    }

    /* Generating the HTML */
    response.render("semesterForm", variables);
  });

  app.get("/adminRemove", (request, response) => {

    let path = `<form action="http://localhost:${portNumber}/adminRemove" method="post">`;

    const variables = {
        path : path
    }

    /* Generating the HTML */
    response.render("adminRemove", variables);
  });

  /* Initializes request.body with post information */ 
  app.use(bodyParser.urlencoded({extended:false}));

  //Application
  app.post("/processCourse", async (request, response) => {
    let {name, gpa, grade, semester, professor, description} = request.body;

    let formattedGPA = Number(gpa).toFixed(2);
    let applicant = {Name: name, GPA : formattedGPA, Grade : grade, Semester : semester, Professor : professor, CourseDescription : description};

    try {
        await client.connect();
       
        predictedAge = await getAge(professor);
        await insertApplicant(client, databaseAndCollection, applicant);

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }

    let time = Date.now();
    let date = new Date(time);

    const variables = {
        name : name,
        gpa : formattedGPA,
        grade : grade,
        semester : semester,
        professor : professor,
        age : predictedAge,
        description : description,
        date : date
    }

    response.render("courseConfirmation", variables);
  });

  //Review Application
  app.post("/processReviewCourse", async (request, response) => {
    let {name} = request.body;
    let result;

    try {
        await client.connect();
        result = await lookUpCourse(client, databaseAndCollection, name);
        predictedAge = await getAge(result.Professor);

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }

    let variables;
    let time = Date.now();
    let date = new Date(time);

    if (result) {
        variables = {
            name : result.Name,
            grade: result.Grade,
            gpa : result.GPA,
            semester : result.Semester,
            professor : result.Professor,
            age : predictedAge,
            description : result.CourseDescription,
            date : date
        }
    } else {
        variables = {
            name : "None",
            grade : "None",
            professor : "None",
            semester : "None",
            gpa : "None",
            age : "None",
            description : "None",
            date : date
        }
    }

    response.render("courseConfirmation", variables);
  });

  //Select by GPA
  app.post("/processAdminGPA", async (request, response) => {
    let {semester} = request.body;
    let result;

    try {
        await client.connect();
       
        result = await lookUpGPA(client, databaseAndCollection, semester);

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }

    const variables = {
        semester : semester,
        gpaTable : result
    }

    response.render("gpaFormResult", variables);
  });

   //Select by Grade
   app.post("/processAdminGrade", async (request, response) => {
    let {grade} = request.body;
    let result;

    try {
        await client.connect();
       
        result = await lookUpGrade(client, databaseAndCollection, grade);

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }

    const variables = {
        grade : grade,
        gradeTable : result
    }

    response.render("gradeFormResult", variables);
  });

     //Select by Professor
     app.post("/processAdminProfessor", async (request, response) => {
        let {professor} = request.body;
        let result;
    
        try {
            await client.connect();
           
            result = await lookUpProfessorCourse(client, databaseAndCollection, professor);
    
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    
        const variables = {
            professor : professor,
            professorTable : result
        }
    
        response.render("professorFormResult", variables);
      });
    
     //Select by Professor
     app.post("/processAdminSemester", async (request, response) => {
        let {semester} = request.body;
        let result;
    
        try {
            await client.connect();
           
            result = await lookUpCoursesSemester(client, databaseAndCollection, semester);
    
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    
        const variables = {
            semester : semester,
            semesterTable : result
        }
    
        response.render("semesterFormResult", variables);
      });

  //Remove All Applications
  app.post("/adminRemove", async (request, response) => {
    let result;
    
    try {
        await client.connect();
       
        result = await removeApplicants();

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }

    const variables = {
        numRemoved : result
    }

    response.render("removeConfirmation", variables);
  });