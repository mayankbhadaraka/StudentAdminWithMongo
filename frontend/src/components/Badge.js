import React from 'react'
import { CloseSvg } from './svg'

const Badge = ({data,onClose}) => {
  return (
    <div>
      <p>
        {data}
      </p>
      <button onClick={onClose}>{CloseSvg}</button>
    </div>
  )
}

export default Badge
