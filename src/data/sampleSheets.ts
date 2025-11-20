// Sample data for multiple sheets to use in development/testing

export const sampleFinancialData = [
  ['Date', 'Account', 'Description', 'Debit', 'Credit', 'Balance'],
  ['2024-01-01', 'Cash', 'Initial Investment', '10000', '0', '10000'],
  ['2024-01-02', 'Equipment', 'Office Equipment Purchase', '0', '2500', '7500'],
  ['2024-01-03', 'Accounts Receivable', 'Sale to Customer A', '0', '1500', '9000'],
  ['2024-01-04', 'Revenue', 'Sale Revenue', '0', '1500', '10500'],
  ['2024-01-05', 'Office Supplies', 'Stationery Purchase', '0', '200', '10300'],
  ['2024-01-06', 'Utilities', 'Electricity Bill', '0', '300', '10000'],
  ['2024-01-07', 'Accounts Payable', 'Supplier Invoice', '0', '800', '9200'],
  ['2024-01-08', 'Cash', 'Customer Payment', '1200', '0', '10400'],
  ['2024-01-09', 'Salaries', 'Employee Salary', '0', '2000', '8400'],
  ['2024-01-10', 'Revenue', 'Service Revenue', '0', '2500', '10900'],
  ['2024-01-11', 'Rent Expense', 'Office Rent', '0', '1200', '9700'],
  ['2024-01-12', 'Cash', 'Client Payment', '800', '0', '10500'],
  ['2024-01-13', 'Marketing', 'Advertising Campaign', '0', '500', '10000'],
  ['2024-01-14', 'Revenue', 'Product Sales', '0', '3200', '13200'],
  ['2024-01-15', 'Insurance', 'Business Insurance', '0', '400', '12800'],
  ['2024-01-16', 'Cash', 'Investment Return', '500', '0', '13300'],
  ['2024-01-17', 'Travel', 'Business Trip', '0', '600', '12700'],
  ['2024-01-18', 'Revenue', 'Consulting Fee', '0', '1800', '14500'],
  ['2024-01-19', 'Software', 'SaaS Subscription', '0', '150', '14350'],
  ['2024-01-20', 'Cash', 'Refund Received', '200', '0', '14550']
];

export const sampleInventoryData = [
  ['Product ID', 'Product Name', 'Category', 'Quantity', 'Unit Price', 'Total Value'],
  ['P001', 'Laptop Computer', 'Electronics', '15', '899.99', '13499.85'],
  ['P002', 'Office Chair', 'Furniture', '25', '199.99', '4999.75'],
  ['P003', 'Desk Lamp', 'Furniture', '40', '29.99', '1199.60'],
  ['P004', 'Wireless Mouse', 'Electronics', '60', '24.99', '1499.40'],
  ['P005', 'Keyboard', 'Electronics', '35', '79.99', '2799.65'],
  ['P006', 'Monitor 27"', 'Electronics', '20', '349.99', '6999.80'],
  ['P007', 'Desk Organizer', 'Office Supplies', '50', '19.99', '999.50'],
  ['P008', 'Notebook Set', 'Office Supplies', '100', '12.99', '1299.00'],
  ['P009', 'Pen Set', 'Office Supplies', '75', '8.99', '674.25'],
  ['P010', 'File Cabinet', 'Furniture', '12', '249.99', '2999.88']
];

export const sampleSalesData = [
  ['Sale ID', 'Date', 'Customer', 'Product', 'Quantity', 'Price', 'Total'],
  ['S001', '2024-01-15', 'Acme Corp', 'Laptop Computer', '2', '899.99', '1799.98'],
  ['S002', '2024-01-16', 'Tech Solutions', 'Monitor 27"', '5', '349.99', '1749.95'],
  ['S003', '2024-01-17', 'Startup Inc', 'Office Chair', '10', '199.99', '1999.90'],
  ['S004', '2024-01-18', 'Global Systems', 'Wireless Mouse', '20', '24.99', '499.80'],
  ['S005', '2024-01-19', 'Digital Works', 'Keyboard', '8', '79.99', '639.92'],
  ['S006', '2024-01-20', 'Innovation Labs', 'Desk Lamp', '15', '29.99', '449.85'],
  ['S007', '2024-01-21', 'Creative Agency', 'Notebook Set', '25', '12.99', '324.75'],
  ['S008', '2024-01-22', 'Media Group', 'File Cabinet', '3', '249.99', '749.97'],
  ['S009', '2024-01-23', 'Consulting Co', 'Pen Set', '30', '8.99', '269.70'],
  ['S010', '2024-01-24', 'Enterprise Ltd', 'Desk Organizer', '20', '19.99', '399.80']
];

export const sampleEmployeeData = [
  ['Employee ID', 'Name', 'Department', 'Position', 'Salary', 'Start Date'],
  ['E001', 'John Smith', 'Sales', 'Sales Manager', '75000', '2022-01-15'],
  ['E002', 'Sarah Johnson', 'Marketing', 'Marketing Director', '85000', '2021-06-01'],
  ['E003', 'Mike Davis', 'IT', 'Software Engineer', '95000', '2023-03-10'],
  ['E004', 'Emily Brown', 'HR', 'HR Manager', '70000', '2022-09-20'],
  ['E005', 'David Wilson', 'Finance', 'Accountant', '65000', '2023-01-05'],
  ['E006', 'Lisa Anderson', 'Sales', 'Sales Representative', '55000', '2023-07-12'],
  ['E007', 'Chris Taylor', 'IT', 'DevOps Engineer', '90000', '2022-11-30'],
  ['E008', 'Jessica Martinez', 'Marketing', 'Content Creator', '60000', '2023-05-18'],
  ['E009', 'Ryan Garcia', 'Finance', 'Financial Analyst', '70000', '2022-04-22'],
  ['E010', 'Amanda White', 'HR', 'Recruiter', '58000', '2023-08-14']
];

// Helper function to convert array data to CSV string
export function dataToCSV(data: string[][]): string {
  return data.map(row => row.join(',')).join('\n');
}

// Helper function to get all sample sheets as CSV
export function getAllSampleSheets() {
  return {
    'Financial Transactions': dataToCSV(sampleFinancialData),
    'Inventory': dataToCSV(sampleInventoryData),
    'Sales': dataToCSV(sampleSalesData),
    'Employees': dataToCSV(sampleEmployeeData),
  };
}

