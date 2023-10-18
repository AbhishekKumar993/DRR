import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Table.css';

const Table = () => {
  const initialData = [
    {
      Action: '',
      ID: 1,
      StartDate: null,
      EndDate: null,
      Month: '',
      'Dates Excluded': [],
      'Number of Days': '',
      'Lead Count': '',
      'Expected DRR': '',
      'Last Updated': '',
    },
  ];

  const [data, setData] = useState(initialData);
  const [expectedDRR, setExpectedDRR] = useState(0);

  useEffect(() => {
    if (data.length > 0) {
      const newData = data.map((row) => {
        const startDate = row.StartDate;
        const excludedDateSet = new Set(
          row['Dates Excluded'].map((date) => new Date(date).toLocaleDateString())
        );
        const totalDays = Math.ceil((row.EndDate - startDate) / (1000 * 60 * 60 * 24));
        const includedDays = totalDays - excludedDateSet.size;
        const expectedDRR = includedDays > 0 ? row['Lead Count'] / includedDays : 0;

        return {
          ...row,
          Month: startDate
            ? startDate.toLocaleString('default', { month: 'long' }) +
              ' ' +
              startDate.getFullYear()
            : '',
          'Number of Days': includedDays,
          'Expected DRR': expectedDRR.toFixed(2),
          'Last Updated': new Date().toLocaleDateString(),
        };
      });

      setData(newData);
    }
  }, [data]);

  const handleStartDateChange = (date, rowIndex) => {
    const newData = [...data];
    newData[rowIndex].StartDate = date;
    setData(newData);
  };

  const handleEndDateChange = (date, rowIndex) => {
    const newData = [...data];
    newData[rowIndex].EndDate = date;
    setData(newData);
  };

  const handleExcludeDate = (date, rowIndex) => {
    const newData = [...data];
    newData[rowIndex]['Dates Excluded'].push(date.toLocaleDateString());
    setData(newData);
  };

  const handleLeadCountChange = (e, rowIndex) => {
    const newLeadCount = e.target.value;

    const totalDays = data[rowIndex]['Number of Days'];
    const expectedDRR = totalDays > 0 ? newLeadCount / totalDays : 0;

    setExpectedDRR(expectedDRR);

    const newData = [...data];
    newData[rowIndex]['Lead Count'] = newLeadCount;
    newData[rowIndex]['Expected DRR'] = expectedDRR.toFixed(2);
    setData(newData);
  };

  const saveData = async () => {
    try {
      const response = await fetch('http://localhost:3001/your-api-endpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save data');
      }

      console.log('Data saved successfully!');
    } catch (error) {
      console.error('Error saving data:', error.message);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Daily Run Rate (DRR) Report</h1>

      <button className="button add-row" onClick={() => setData([...data, ...initialData])}>
        Add Row
      </button>

      <button className="button save" onClick={saveData}>
        Save
      </button>

      <table className="data-table">
        <thead>
          <tr>
            {Object.keys(initialData[0]).map((column) => (
              <th key={column} className="table-header">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {Object.keys(row).map((column, columnIndex) => (
                <td key={columnIndex} className="table-cell">
                  {column === 'StartDate' || column === 'EndDate' ? (
                    <DatePicker
                      selected={row[column]}
                      onChange={(date) => {
                        if (column === 'StartDate') {
                          handleStartDateChange(date, rowIndex);
                        } else {
                          handleEndDateChange(date, rowIndex);
                        }
                      }}
                    />
                  ) : column === 'Dates Excluded' ? (
                    <>
                      <DatePicker
                        selected={null}
                        onChange={(date) => handleExcludeDate(date, rowIndex)}
                      />
                      {row[column].join(', ')}
                    </>
                  ) : column === 'Number of Days' ? (
                    row[column]
                  ) : column === 'Expected DRR' ? (
                    parseFloat(row[column]).toFixed(2)
                  ) : (
                    <input
                      type="text"
                      value={row[column]}
                      onChange={(e) => handleLeadCountChange(e, rowIndex)}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
