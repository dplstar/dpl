import PipeTable from '../components/PipeTable.jsx'
import { useNavigation } from '../NavigationContext.jsx'
import { PRODS } from '../data/siteData.js'
import './ProductsPage.css'
import PipesRange from '../components/PipesRange.jsx'
import ProductCategory from '../components/ProductCategory.jsx'
import { PRODUCT_CATEGORIES } from '../data/productCategories.js'

const PRODUCT_PAGE_MAP = {
  za: 'zincalume',
  cb: 'colour-bonded',
  fbe: 'fusion-bond',
  gfs: 'glass-fused'
}

export default function ProductsPage({ active }) {
  const { goTo } = useNavigation()

  return (
    <div className={`page${active ? ' active' : ''}`} data-page="products">
      <section className="products-showcase">
        <div className="shell">
          <div className="products-showcase__heading">
            <div className="sec-tag">Complete Product Range</div>
            <h1>Storage Solutions</h1>
            <p>High-quality storage solutions for various industrial and commercial applications.</p>
          </div>
          <div className="products-showcase__grid">
            {PRODS.map((product) => (
              <article className="products-showcase__card" key={product.id}>
                <div className="products-showcase__image"><img src={product.img} alt={product.imgAlt} /></div>
                <div className="products-showcase__card-body">
                  <h2>{product.name}</h2>
                  <button className="btn btn-dark" onClick={() => goTo(PRODUCT_PAGE_MAP[product.id] || 'products')}>
                    Explore
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

    
      <PipesRange/>
      <ProductCategory category={PRODUCT_CATEGORIES.find((category) => category.id === 'tube-well-fittings')} />
      <ProductCategory category={PRODUCT_CATEGORIES.find((category) => category.id === 'pump-fittings')} />
      {/* <PipeTable/> */}
    </div>
  )
}
