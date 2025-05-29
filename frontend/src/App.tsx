import './App.css'

const cards = ["Youtube", "Maps", "Gmail", "Drive", "Calendar", "Chrome"]

function App() {
  
  return (
    <>
    <div className='justify-center m-5'>
      <div className='w-full flex justify-between mb-5'>
        <div className=''>Takeout Exlorer</div>
        
        <label className="input">
          <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <g
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="2.5"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </g>
          </svg>
          <input type="search" required placeholder="Search" />
        </label>

        <div className=''>Local host</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {cards.map(
          (card, index) => (
            <div 
              className='rounded-lg shadow p-4 btn h-50'
              key={index}
              >
              {card}
            </div>
          )
        )}
      </div>
    </div>
    </>
  )
}

export default App
