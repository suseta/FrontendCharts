import React from 'react';
import FilteredChart from './Components/FilteredChart';

const App = () => {
  const appStyle = {
    backgroundColor: 'lightgreen',
    textAlign: 'center',
    marginTop: '20px',
  };

  return (
    <div style={appStyle}>
      <h1>Data Visualization Dashboard</h1>
      <FilteredChart />
    </div>
  );
};

export default App;
