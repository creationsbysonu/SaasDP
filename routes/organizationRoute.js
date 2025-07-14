const { renderOrganizationForm, createOrganization, createQuestionsTable, createAnswersTable, renderDashboard, renderForumPage, renderQuestionPage, createQuestion } = require('../controller/organization/organizationController')
const { isAuthenticated } = require('../middleware/isAuthenticated')

const router = require('express').Router()


router.route('/organization').get(renderOrganizationForm).post(isAuthenticated,createOrganization,createQuestionsTable, createAnswersTable)
router.route('/dashboard').get(isAuthenticated, renderDashboard) //dashboard jasle paye tesle herna paidaina tei vayera authenticate garne isAuthenticated use garera

router.route('/forum').get(isAuthenticated, renderForumPage)
router.route('/question').get(isAuthenticated, renderQuestionPage).post(isAuthenticated, createQuestion)

module.exports = router