import './Scss/app.scss';
import { useEffect, useState } from 'react';
import TableComponent from './components/TableComponent';

function App() {
  const tableHead = ['Name', "Total Marks", "Total Subject", "Average", "Rank", "Marksheet Images"]
  const [tableRow, setTableRow] = useState({ data: [], total: 0 })
  const [searchFilter, setSearchFilter] = useState({ studentId: "", subjectId: "", averageStart: "", averageEnd: "" })
  const [page, setPage] = useState(1)
  const [error, setError] = useState(null)
  let limit = 2
  const [debouncedSearchFilter, setDebouncedSearchFilter] = useState(searchFilter);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchFilter(searchFilter);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchFilter]);

  useEffect(() => {
    setTableRow({ data: [], total: 0 })
    setError("")
    getTableData()
  }, [page, JSON.stringify(debouncedSearchFilter)])

  const getTableData = async () => {
    try {
      let newError=""
      let query = `limit=${limit}&page=${page}`
      if (searchFilter.studentId) query = `${query}&studentId=${searchFilter.studentId}`
      if (searchFilter.subjectId) query = `${query}&subjectId=${searchFilter.subjectId}`
      if (searchFilter.averageStart){
        if(searchFilter.averageStart<0 ||searchFilter.averageStart>100) newError="Enter Valid Average Start Value"
        query = `${query}&averageStart=${searchFilter.averageStart}`
      }
      if (searchFilter.averageEnd){ 
        if(searchFilter.averageEnd<0 ||searchFilter.averageEnd>100) newError="Enter Valid Average Start Value"
        query = `${query}&averageEnd=${searchFilter.averageEnd}`
      }
      if(!newError){
        let response = await fetch(`http://localhost:3005/api/v1/query/paginatedData?${query}`);
        if (response.status != 200) {
          throw new Error('Network response was not ok.');
        }
        let data = await response.json();
        setTableRow(data)
        return data;
      }else{
        setError(newError)
      }
    } catch (error) {
      return <h3>Internal Error</h3>;
    }
  };

  const rowMarkup = (
    <>
      {tableRow.data.map((row, key) => (
        <tr key={key}>
          <td>{row.studentName}</td>
          <td>{row.totalMarks}</td>
          <td>{row.totalSubjects}</td>
          <td>{row.marksPerSubject.toFixed(2)}</td>
          <td>{(page-1)*limit+key + 1}</td>
          <td>
            <div className='flex'>
              {row?.imgPaths?.length > 0 ? (
                <>
                  {row.imgPaths.slice(0, 2).map((img, index) => (
                    <img
                      src={`http://localhost:3005${img}`} // Update the src attribute
                      key={index}
                      alt={`Image ${index}`} // Provide alt text for accessibility
                    />
                  ))}
                  {row.imgPaths.length > 2 && <p>And more...</p>}
                </>
              ) : (
                <p>No Image Found</p>
              )}

            </div>
          </td>
        </tr>
      ))}
    </>
  );

  return (
    <div className="App">
      <h2 className='title'>Student Details</h2>
      <div className='filter flex'>
        <h4>Student Id <input type="text" value={searchFilter.studentId} name="studentId" onChange={(e) => setSearchFilter({ ...searchFilter, "studentId": e.target.value })} /></h4>
        <h4>Subject Id <input type="text" value={searchFilter.subjectId} name="subjectId" onChange={(e) => setSearchFilter({ ...searchFilter, "subjectId": e.target.value })} /></h4>
        <h4>Average Start <input type="text" value={searchFilter.averageStart} name="averageStart" onChange={(e) => setSearchFilter({ ...searchFilter, "averageStart": e.target.value })} /></h4>
        <h4>Average end <input type="text" value={searchFilter.averageEnd} name="averageEnd" onChange={(e) => setSearchFilter({ ...searchFilter, "averageEnd": e.target.value })} /></h4>
      </div>
      {error?<div className='error'><h3>{error}</h3></div>:null}
      {tableRow.data.length > 0 ? <TableComponent title={tableHead} row={rowMarkup} /> : <h3>No Records Found</h3>}
      <div className='pagination'>
        <button className='primary' onClick={() => setPage(page - 1)} disabled={page == 1}>Prev</button>
        <button className='secondary' onClick={() => setPage(page + 1)} disabled={page * limit >= tableRow.total}>Next</button>
      </div>
    </div>
  );
}

export default App;
