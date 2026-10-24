import { HashRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Ecosystem } from './pages/Ecosystem'
import { DataPage } from './pages/DataPage'
import { EmailPage } from './pages/EmailPage'
import { ReportPage } from './pages/ReportPage'
import { PlantPage } from './pages/PlantPage'
import { AskPage } from './pages/AskPage'
import { NearPage } from './pages/NearPage'
import { ProductPage } from './pages/ProductPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="ecosystem" element={<Ecosystem />} />
          <Route path="data" element={<DataPage />} />
          <Route path="near" element={<NearPage />} />
          <Route path="product" element={<ProductPage />} />
          <Route path="email" element={<EmailPage />} />
          <Route path="report" element={<ReportPage />} />
          <Route path="plant" element={<PlantPage />} />
          <Route path="ask" element={<AskPage />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
