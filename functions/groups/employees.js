import express from 'express'
import admin from 'firebase-admin'
import employeeSchemas from '../common/schemas/employee_schemas.js'
import { validateRequest } from '../middlewares/validation.js'

const router = express.Router()
const db = admin.firestore()

// Get all employees for a company
router.get('/', async (req, res) => {
  try {
    const companyId = req.query.companyId || 'demo-company'
    
    const employeesRef = db.collection('companies').doc(companyId).collection('employees')
    const snapshot = await employeesRef.orderBy('fullName').get()
    
    const employees = []
    snapshot.forEach(doc => {
      employees.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    res.json({ success: true, data: employees })
  } catch (error) {
    console.error('Error fetching employees:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch employees' })
  }
})

// Get a single employee
router.get('/:id', async (req, res) => {
  try {
    const companyId = req.query.companyId || 'demo-company'
    const { id } = req.params
    
    const employeeDoc = await db
      .collection('companies')
      .doc(companyId)
      .collection('employees')
      .doc(id)
      .get()
    
    if (!employeeDoc.exists) {
      return res.status(404).json({ success: false, error: 'Employee not found' })
    }
    
    res.json({
      success: true,
      data: { id: employeeDoc.id, ...employeeDoc.data() }
    })
  } catch (error) {
    console.error('Error fetching employee:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch employee' })
  }
})

// Create a new employee
router.post('/', validateRequest(employeeSchemas.createEmployee), async (req, res) => {
  try {
    const companyId = req.body.companyId || 'demo-company'
    const { firstName, lastName, email, department, jobTitle, manager, location, startDate } = req.body
    
    const employeeData = {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email,
      department: department || null,
      jobTitle: jobTitle || null,
      manager: manager || null,
      location: location || null,
      startDate: startDate || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
    
    const employeesRef = db.collection('companies').doc(companyId).collection('employees')
    const docRef = await employeesRef.add(employeeData)
    
    res.status(201).json({
      success: true,
      data: { id: docRef.id, ...employeeData }
    })
  } catch (error) {
    console.error('Error creating employee:', error)
    res.status(500).json({ success: false, error: 'Failed to create employee' })
  }
})

// Update an employee
router.put('/:id', validateRequest(employeeSchemas.updateEmployee), async (req, res) => {
  try {
    const companyId = req.body.companyId || 'demo-company'
    const { id } = req.params
    const updates = { ...req.body }
    delete updates.companyId
    
    // Update fullName if firstName or lastName changed
    if (updates.firstName || updates.lastName) {
      const employeeDoc = await db
        .collection('companies')
        .doc(companyId)
        .collection('employees')
        .doc(id)
        .get()
      
      const currentData = employeeDoc.data()
      const firstName = updates.firstName || currentData.firstName
      const lastName = updates.lastName || currentData.lastName
      updates.fullName = `${firstName} ${lastName}`
    }
    
    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp()
    
    await db
      .collection('companies')
      .doc(companyId)
      .collection('employees')
      .doc(id)
      .update(updates)
    
    res.json({ success: true, data: { id, ...updates } })
  } catch (error) {
    console.error('Error updating employee:', error)
    res.status(500).json({ success: false, error: 'Failed to update employee' })
  }
})

// Delete an employee
router.delete('/:id', async (req, res) => {
  try {
    const companyId = req.query.companyId || 'demo-company'
    const { id } = req.params
    
    await db
      .collection('companies')
      .doc(companyId)
      .collection('employees')
      .doc(id)
      .delete()
    
    res.json({ success: true, message: 'Employee deleted successfully' })
  } catch (error) {
    console.error('Error deleting employee:', error)
    res.status(500).json({ success: false, error: 'Failed to delete employee' })
  }
})

export default router

