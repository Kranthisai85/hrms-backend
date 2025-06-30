const XLSX = require('xlsx');

// Generate Employee Test Data
const generateEmployeeData = () => {
  const employees = [
    {
      'First Name': 'John',
      'Last Name': 'Doe',
      'Email': 'john.doe@test.com',
      'Phone': '1234567890',
      'Department': 'IT',
      'Designation': 'Software Engineer',
      'Join Date': '2023-01-15',
      'Salary': '50000',
      'Blood Group': 'O+',
      'Emergency Contact': '9876543210',
      'Bank Name': 'Test Bank',
      'Account Number': '1234567890',
      'IFSC Code': 'TEST0001'
    },
    {
      'First Name': 'Jane',
      'Last Name': 'Smith',
      'Email': 'jane.smith@test.com',
      'Phone': '2345678901',
      'Department': 'HR',
      'Designation': 'HR Manager',
      'Join Date': '2023-02-01',
      'Salary': '60000',
      'Blood Group': 'A+',
      'Emergency Contact': '8765432109',
      'Bank Name': 'Test Bank',
      'Account Number': '2345678901',
      'IFSC Code': 'TEST0001'
    },
    {
      'First Name': 'Mike',
      'Last Name': 'Johnson',
      'Email': 'mike.johnson@test.com',
      'Phone': '3456789012',
      'Department': 'Finance',
      'Designation': 'Financial Analyst',
      'Join Date': '2023-03-15',
      'Salary': '55000',
      'Blood Group': 'B+',
      'Emergency Contact': '7654321098',
      'Bank Name': 'Test Bank',
      'Account Number': '3456789012',
      'IFSC Code': 'TEST0001'
    }
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(employees);
  XLSX.utils.book_append_sheet(wb, ws, 'Employees');
  XLSX.writeFile(wb, 'employee_import_test.xlsx');
  console.log('✓ Generated employee_import_test.xlsx');
};

// Generate Attendance Test Data
const generateAttendanceData = () => {
  const attendance = [
    {
      'Employee ID': 'EMP001',
      'Date': '2023-12-01',
      'Status': 'Present',
      'Check In': '09:00:00',
      'Check Out': '18:00:00',
      'Remarks': 'On time'
    },
    {
      'Employee ID': 'EMP002',
      'Date': '2023-12-01',
      'Status': 'Present',
      'Check In': '09:15:00',
      'Check Out': '18:30:00',
      'Remarks': 'Slight delay'
    },
    {
      'Employee ID': 'EMP003',
      'Date': '2023-12-01',
      'Status': 'Half Day',
      'Check In': '09:00:00',
      'Check Out': '13:00:00',
      'Remarks': 'Left early - approved'
    }
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(attendance);
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
  XLSX.writeFile(wb, 'attendance_import_test.xlsx');
  console.log('✓ Generated attendance_import_test.xlsx');
};

// Generate Tax Declaration Test Data
const generateTaxDeclarationData = () => {
  const declarations = [
    {
      'Employee ID': 'EMP001',
      'Financial Year': '2023-24',
      'Tax Regime': 'old',
      'Investments': JSON.stringify({
        '80C': 150000,
        '80D': 25000,
        'HRA': 120000
      }),
      'Rent Details': JSON.stringify({
        'monthly_rent': 20000,
        'landlord_name': 'Test Landlord',
        'landlord_pan': 'ABCDE1234F'
      }),
      'Other Income': JSON.stringify({
        'interest': 50000,
        'rental': 120000
      })
    },
    {
      'Employee ID': 'EMP002',
      'Financial Year': '2023-24',
      'Tax Regime': 'new',
      'Investments': JSON.stringify({
        '80C': 0,
        '80D': 0,
        'HRA': 0
      }),
      'Rent Details': '{}',
      'Other Income': JSON.stringify({
        'interest': 30000
      })
    }
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(declarations);
  XLSX.utils.book_append_sheet(wb, ws, 'TaxDeclarations');
  XLSX.writeFile(wb, 'tax_declaration_import_test.xlsx');
  console.log('✓ Generated tax_declaration_import_test.xlsx');
};

// Generate all test data files
console.log('Generating test data files...\n');
generateEmployeeData();
generateAttendanceData();
generateTaxDeclarationData();
console.log('\nAll test data files generated successfully!');
