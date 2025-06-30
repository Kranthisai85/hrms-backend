const axios = require('axios');

const API_URL = 'http://localhost:3001/api';
let authToken = '';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for auth token
api.interceptors.request.use(
  config => {
    if (authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
      console.log('Request Headers:', config.headers);
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  response => {
    logResponse(response);
    return response;
  },
  error => {
    logError(error);
    return Promise.reject(error);
  }
);

// Helper function to set auth token
const setAuthToken = (token) => {
  console.log('\nSetting auth token:', token);
  authToken = token;
  // Set token for all future requests
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  console.log('Updated headers:', api.defaults.headers);
};

// Helper function to log response data
const logResponse = (response) => {
  console.log('\nResponse Status:', response.status);
  console.log('Response Headers:', JSON.stringify(response.headers, null, 2));
  console.log('Response Data:', JSON.stringify(response.data, null, 2));
};

// Helper function to log error details
const logError = (error) => {
  console.error('\nError Details:');
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Data:', JSON.stringify(error.response.data, null, 2));
    console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
    if (error.config) {
      console.error('Request Headers:', error.config.headers);
    }
  } else if (error.request) {
    console.error('No response received');
    console.error('Request:', error.request);
  } else {
    console.error('Error:', error.message);
  }
};

// 1. Authentication Tests
const loginAdmin = async () => {
  try {
    console.log('\n1. Testing Admin Login...');
    console.log('Request:', JSON.stringify(adminCredentials, null, 2));
    
    const response = await api.post('/auth/login', adminCredentials);
    setAuthToken(response.data.token);
    console.log('✓ Admin login successful\n');
    return true;
  } catch (error) {
    console.error('✗ Admin login failed');
    return false;
  }
};

// Test user credentials
const adminCredentials = {
  email: 'admin@test.com',
  password: 'admin123'
};

// 2. Employee Management Tests
const testEmployeeOperations = async () => {
  try {
    console.log('\n2. Testing Employee Operations...');

    // Create Employee
    console.log('\n2.1 Creating new employee...');
    const employeeData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@test.com',
      password: 'employee123',
      department: 'IT',
      designation: 'Software Engineer',
      salary: 50000,
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'Active'
    };
    console.log('Request:', JSON.stringify(employeeData, null, 2));
    console.log('Current Headers:', api.defaults.headers);
    
    const createResponse = await api.post('/employees', employeeData);
    const employeeId = createResponse.data.data.id;
    console.log('✓ Employee created successfully');

    // Get Employees
    console.log('\n2.2 Fetching all employees...');
    const getResponse = await api.get('/employees');
    console.log(`✓ Retrieved ${getResponse.data.data.length} employees`);

    // Update Employee
    console.log('\n2.3 Updating employee...');
    const updateData = {
      designation: 'Senior Software Engineer',
      salary: 60000
    };
    console.log('Request:', JSON.stringify(updateData, null, 2));
    
    const updateResponse = await api.put(`/employees/${employeeId}`, updateData);
    console.log('✓ Employee updated successfully');

    console.log('\n✓ All employee operations passed');
    return { success: true, employeeId };
  } catch (error) {
    console.error('✗ Employee operations failed');
    return { success: false };
  }
};

// Main test execution
const runTests = async () => {
  console.log('Starting API Tests...');

  // Run tests sequentially
  const loginSuccess = await loginAdmin();
  if (!loginSuccess) return;

  const { success: employeeSuccess, employeeId } = await testEmployeeOperations();
  if (!employeeSuccess) return;

  console.log('\nAll tests completed!');
};

// Run the tests
runTests();
