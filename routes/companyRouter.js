import express from 'express';
import { addCompany, getCompanyDetails, getCompanyDetailsByName } from '../controllers/companyController.js';

const router = express.Router();

router.post('/add', addCompany);

router.get('/:id',getCompanyDetails);
router.get('/name/:name',getCompanyDetailsByName);

export default router;

