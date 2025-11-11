import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import type { Employee } from '@/types/employee'

interface EmployeeTableProps {
  employees: Employee[]
}

export default function EmployeeTable({ employees }: EmployeeTableProps) {
  if (employees.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary">
        No employees found. Connect your HRIS to import employee data.
      </Typography>
    )
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Job Title</TableCell>
            <TableCell>Manager</TableCell>
            <TableCell>Location</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>{employee.fullName}</TableCell>
              <TableCell>{employee.email}</TableCell>
              <TableCell>{employee.department || '-'}</TableCell>
              <TableCell>{employee.jobTitle || '-'}</TableCell>
              <TableCell>{employee.manager || '-'}</TableCell>
              <TableCell>{employee.location || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

