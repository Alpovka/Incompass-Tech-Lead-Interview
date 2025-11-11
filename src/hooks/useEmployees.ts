import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { Employee } from '@/types/employee'

export function useEmployees(companyId: string = 'demo-company') {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true)
        const employeesRef = collection(db, `companies/${companyId}/employees`)
        const q = query(employeesRef, orderBy('fullName'))
        const snapshot = await getDocs(q)
        
        const employeesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Employee[]
        
        setEmployees(employeesList)
        setError(null)
      } catch (err) {
        console.error('Error fetching employees:', err)
        setError('Failed to fetch employees')
      } finally {
        setLoading(false)
      }
    }

    fetchEmployees()
  }, [companyId])

  const refetch = async () => {
    setLoading(true)
    try {
      const employeesRef = collection(db, `companies/${companyId}/employees`)
      const q = query(employeesRef, orderBy('fullName'))
      const snapshot = await getDocs(q)
      
      const employeesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Employee[]
      
      setEmployees(employeesList)
      setError(null)
    } catch (err) {
      console.error('Error fetching employees:', err)
      setError('Failed to fetch employees')
    } finally {
      setLoading(false)
    }
  }

  return { employees, loading, error, refetch }
}

