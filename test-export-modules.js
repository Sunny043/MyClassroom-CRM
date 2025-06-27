// Test script to verify export functionality
const XLSX = require('xlsx');
const { jsPDF } = require('jspdf');
require('jspdf-autotable');

console.log('Testing export modules...');

// Test Excel export
try {
  const testData = [
    { Name: 'John Doe', Email: 'john@example.com', Roll: '001' },
    { Name: 'Jane Smith', Email: 'jane@example.com', Roll: '002' }
  ];
  
  const worksheet = XLSX.utils.json_to_sheet(testData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Test");
  
  console.log('✅ Excel export modules working correctly');
} catch (error) {
  console.log('❌ Excel export error:', error.message);
}

// Test PDF export
try {
  const doc = new jsPDF();
  doc.text('Test PDF', 10, 10);
  
  // Test autoTable
  doc.autoTable({
    head: [['Name', 'Email']],
    body: [['John Doe', 'john@example.com']],
  });
  
  console.log('✅ PDF export modules working correctly');
} catch (error) {
  console.log('❌ PDF export error:', error.message);
}

console.log('Export module test completed!');
