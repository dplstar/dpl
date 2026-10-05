import ZincalumeTank from './ZincalumeTank.jsx'

export default function GITank({ diameter = 10, courses = 6, ...props }) {
  return <ZincalumeTank diameter={diameter} rings={courses} {...props} />
}