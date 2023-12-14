import React from 'react'
import '../Scss/table.scss'
const TableComponent = (props) => {
  const tableRow = props.row
  const tableHead = props.title
  if (tableRow.length == 0) return (<h1>No Data Found</h1>)
  return (
    <table>
      <thead>
        <tr>
          {
            tableHead.map((heading, key) => {
              return (
                <th key={key}>{heading}</th>
              )
            })
          }
        </tr>
      </thead>
      <tbody>
        {tableRow}
      </tbody>
    </table>
  )
}

export default TableComponent
