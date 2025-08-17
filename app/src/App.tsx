import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Burn Wizard</h1>
          <p className="text-gray-600 mt-2">Clinical tool for burn assessment and fluid management</p>
          <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded-md mt-4">
            ⚠️ Educational Tool Only - Not for Direct Patient Care - Verify All Calculations
          </div>
        </header>

        <main className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
          <p className="text-gray-700">
            Welcome to Burn Wizard! This application will help you with burn assessment calculations.
            The full interface is being set up. For now, this confirms the basic structure is working.
          </p>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h3 className="font-medium text-blue-900">Next Steps:</h3>
            <ul className="mt-2 text-blue-800 space-y-1">
              <li>• Install dependencies with npm install</li>
              <li>• Start development server with npm run dev</li>
              <li>• Run tests with npm test</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;