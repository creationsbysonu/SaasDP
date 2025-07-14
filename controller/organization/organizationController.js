const { users,sequelize } = require('../../model');
const { QueryTypes } = require("sequelize");

exports.renderOrganizationForm = (req, res) => {
    res.render("addOrganization");
};

//generating random number for the refrence in table
const generateRandomNumber = ()=>{
    return Math.floor(1000+ Math.random() *9000)
}


exports.createOrganization = async (req, res, next) => {
    const organizationNumber = generateRandomNumber()

    const userId = req.userId
    //find data of above userId
    const user = await users.findByPk(userId)
    const {
        organizationName,
        organizationAddress,
        organizationPhoneNumber,
        organizationEmail
    } = req.body;

    const organizationVatNumber = req.body.organizationVatNumber || null;
    const organizationPanNumber = req.body.organizationPanNumber || null;

    try {
        // Create table if it doesn't exist
        
        //create users_org table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS users_org(
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                userId INT REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE, organizationNumber VARCHAR(255)
            )
        `, { type: QueryTypes.CREATE });
        
        //create organization table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS organization_${organizationNumber} (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                address VARCHAR(255),
                phoneNumber VARCHAR(255),
                email VARCHAR(255),
                vatNumber VARCHAR(255),
                panNumber VARCHAR(255)
            )
        `, { type: QueryTypes.CREATE });

        // Insert data into organization table
        await sequelize.query(`
            INSERT INTO organization_${organizationNumber} 
            (name, address, phoneNumber, email, vatNumber, panNumber)
            VALUES (?, ?, ?, ?, ?, ?)
        `, {
            type: QueryTypes.INSERT,
            replacements: [
                organizationName,
                organizationAddress,
                organizationPhoneNumber,
                organizationEmail,
                organizationVatNumber,
                organizationPanNumber
            ]
        });

        //insert data into users_org table
        await sequelize.query(`
            INSERT INTO users_org
            (userId,organizationNumber)
            VALUES (?, ?)
        `, {
            type: QueryTypes.INSERT,
            replacements: [
                userId,
                organizationNumber
            ]
        });

        user.currentOrgNumber = organizationNumber
        user.save()
        req.organizationNumber = organizationNumber
        next()
        
    } catch (error) {
        console.error("Error creating organization:", error);
        res.status(500).send("Something went wrong!");
    }
};

exports.createQuestionsTable = async (req, res,next) => {
    const organizationNumber = req.organizationNumber

    try {
        //create questions table
        await sequelize.query(`
                CREATE TABLE questions_${organizationNumber}(
                    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255), description TEXT, userid INT NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `, { type: QueryTypes.CREATE })
        next()
    } catch (error) {
        console.error("Error creating questions table:", error);
        res.status(500).send("Something went wrong (in questions table creation)");
    }

    
}


exports.createAnswersTable = async(req,res)=>{

    const organizationNumber = req.organizationNumber

    try {
        await sequelize.query(`
            CREATE TABLE answers_${organizationNumber}(
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, userId INT NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE, answer TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, questionId INT NOT NULL)`, {
                type: QueryTypes.CREATE})
                res.redirect('/dashboard');
    } catch (error) {
        console.error("Error creating the answer table:",error)
        res.status(500).send("Something went wrong(in answer table creation)")
    }
    res.redirect("/dashboard")
}


//dashboard
exports.renderDashboard = (req,res)=>{
    res.render("dashboard/index")
}

exports.renderForumPage = async(req,res)=>{
    const organizationNumber = req.user[0].currentOrgNumber
    const questions = await sequelize.query(`SELECT * FROM questions_${organizationNumber}`,{
        type: QueryTypes.SELECT
    })
    res.render("dashboard/forum", {questions:questions})
}

exports.renderQuestionPage = (req,res)=>{

    res.render("dashboard/askQuestion")
}

exports.createQuestion = async(req,res)=>{
    const organizationNumber = req.user[0].currentOrgNumber
    const {title,description} = req.body
    console.log(organizationNumber) //to check which organization is currently running
    const userId = req.userId
    if(!title || !description){
        console.log("please add the title or description")
    }

//insert data into table
await sequelize.query(`INSERT INTO questions_${organizationNumber} (title,description,userId) VALUES (?,?,?)`,{
    type: QueryTypes.INSERT,
    replacements : [title,description,userId]
})
res.redirect('/forum')


}



