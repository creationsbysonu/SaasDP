const { users,sequelize } = require('../../model');
const { QueryTypes } = require("sequelize");

exports.renderOrganizationForm = (req, res) => {
    res.render("addOrganization");
};


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
        

        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS users_org(
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                userId INT REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE, organizationNumber VARCHAR(255)
            )
        `, { type: QueryTypes.CREATE });

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

        // Insert data
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

exports.createForumTable = async (req, res) => {
    const organizationNumber = req.organizationNumber

    try {
        await sequelize.query(`
                CREATE TABLE forum_${organizationNumber}(
                    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                    questions VARCHAR(255), answer VARCHAR(255)
                )
            `, { type: QueryTypes.CREATE })
        res.send("Organization created successfully!")
    } catch (error) {
        console.error("Error creating organization:", error);
        res.status(500).send("Something went wrong!");
    }

    
}
