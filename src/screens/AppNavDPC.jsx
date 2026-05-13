import React from 'react'
import { AppProvider } from '../components/custom/AppContext'
import DPCDrawer from '../components/drawer/DPCDrawer'

const AppNavDPC = () => {
  return (
      <AppProvider>
      <DPCDrawer/>
    </AppProvider>
  )
}

export default AppNavDPC