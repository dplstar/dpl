import FBTank from './FBTank.jsx'

export const GFS_COLORS = {
  blue: '#1d4f91',
  green: '#1f5c3f',
  white: '#eceee9',
  gray: '#8a9096',
}

export default function GFSTank({ diameter = 12, courses = 6, roof = 'membrane', color = GFS_COLORS.green, ...props }) {
  return (
    <FBTank
      diameter={diameter}
      courses={courses}
      color={color}
      {...props}
    />
  )
}