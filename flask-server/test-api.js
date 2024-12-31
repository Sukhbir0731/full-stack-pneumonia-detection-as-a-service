// test.js
const testBackend = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/test');
    const data = await response.json();
    console.log('Backend response:', data);
    return data;
  } catch (error) {
    console.error('Error testing backend:', error);
    return null;
  }
};

// Run the test
testBackend();
