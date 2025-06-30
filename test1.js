const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_URL = 'http://localhost:3001/api';
let authToken = '';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  config => {
    if (authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Test admin login
const loginAdmin = async () => {
  try {
    console.log('\n1. Testing Admin Login...');
    const response = await api.post('/auth/login', {
      email: 'admin@test.com',
      password: 'admin123'
    });
    
    authToken = response.data.token;
    console.log('✓ Admin login successful');
    return true;
  } catch (error) {
    console.error('✗ Admin login failed:', error.response?.data || error.message);
    return false;
  }
};

// Download attendance template
const downloadTemplate = async () => {
  try {
    console.log('\n2. Downloading attendance template...');
    const response = await api.get('/attendance/template', {
      responseType: 'arraybuffer'
    });
    
    fs.writeFileSync('attendance_template.xlsx', response.data);
    console.log('✓ Template downloaded successfully');
    return true;
  } catch (error) {
    console.error('✗ Template download failed:', error.response?.data || error.message);
    return false;
  }
};

// Import attendance data
const importAttendance = async () => {
  try {
    console.log('\n3. Importing attendance data...');
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream('attendance_import_test.xlsx'));
    
    const response = await api.post('/attendance/import', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✓ Attendance data imported successfully');
    console.log('Imported records:', response.data.count);
    return true;
  } catch (error) {
    console.error('✗ Attendance import failed:', error.response?.data || error.message);
    return false;
  }
};

// Verify imported attendance
const verifyImport = async () => {
  try {
    console.log('\n4. Verifying imported attendance...');
    const currentDate = new Date();
    const response = await api.get('/attendance/stats', {
      params: {
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear()
      }
    });
    
    console.log('✓ Attendance verification successful');
    console.log('Total records:', response.data.data.length);
    return true;
  } catch (error) {
    console.error('✗ Attendance verification failed:', error.response?.data || error.message);
    return false;
  }
};

// Run all tests
const runTests = async () => {
  console.log('Starting Bulk Attendance Import Tests...');

  // Run tests sequentially
  const loginSuccess = await loginAdmin();
  if (!loginSuccess) return;

  const templateSuccess = await downloadTemplate();
  if (!templateSuccess) return;

  const importSuccess = await importAttendance();
  if (!importSuccess) return;

  const verifySuccess = await verifyImport();
  if (!verifySuccess) return;

  console.log('\nAll tests completed successfully!');
};

// Execute tests
runTests();