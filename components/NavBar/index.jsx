'use client'
import { useState } from 'react'
import Link from 'next/link'
export default () => {

  const [state, setState] = useState(false)

  // Replace javascript:void(0) path with your path
  const navigation = [
      { title: "Home", path: "/" },
      { title: "Upload", path: "/upload" },
      { title: "History", path: "/history" },
    //   { title: "Partners", path: "javascript:void(0)" }
  ]

  return (
      <nav className="bg-white w-full border-b md:border-0 md:static">
          <div className="items-center px-4 max-w-screen-xl mx-auto md:flex md:px-8">
              <div className="flex items-center justify-between py-2  md:block">
                    <Link href="/">
                        <img
                            src="logo-emage-group.png" 
                            // width={120} 
                            // height={30}
                            alt="Float UI logo"
                            className='h-14 w-40  '
                        />
                        {/* <span className='text-2xl font-extrabold' >

                        EV-LOGO
                        </span> */}
                    </Link>
                  <div className="md:hidden">
                      <button className="text-gray-700 outline-none p-2 rounded-md focus:border-gray-400 focus:border"
                          onClick={() => setState(!state)}
                      >
                          {
                              state ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                              ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                  </svg>
                              )
                          }
                      </button>
                  </div>
              </div>
              <div className={`flex-1 justify-self-center pb-3 mt-8 md:block md:pb-0 md:mt-0 ${ state ? 'block' : 'hidden'}`}>
                  <ul className="justify-center items-center space-y-8 md:flex md:space-x-6 md:space-y-0">
                      {
                          navigation.map((item, idx) => {
                              return (
                                <li 
                                key={idx} 
                                className="text-gray-600 px-4 py-1 rounded-md hover:text-blue-700 hover:shadow-[0_0_10px_2px_rgba(29,78,216,0.5)] transition-all duration-300"
                            >
                                <Link href={item.path}>
                                    {item.title}
                                </Link>
                            </li>
                            
                              )
                          })
                      }
                  </ul>
              </div>
              <div className="hidden md:inline-block">
                <Link href="/upload" className="py-3 px-4 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow">
                    Get Started
                </Link>
              </div>
          </div>
      </nav>
  )
}