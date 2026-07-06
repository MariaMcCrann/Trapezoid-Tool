import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import ChannelFlow from './pages/ChannelFlow.jsx'
import StageStorage from './pages/StageStorage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/channel-flow" element={<ChannelFlow />} />
        <Route path="/stage-storage" element={<StageStorage />} />
      </Route>
    </Routes>
  )
}
