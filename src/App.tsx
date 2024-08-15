import { createHashRouter, RouterProvider } from "react-router-dom";
import Home from "@/pages/Home";
import Blog from "@/pages/Blog";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const router = createHashRouter([
  {
    path: "/",
    element: (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="container w-full md:w-2/3 flex-grow p-4">
          <Home />
        </div>
        <Footer />
      </div>
    ),
  },
  {
    path: "/blog/blogpost/:id",
    element: (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="container w-full md:w-2/3 flex-grow p-4">
          <Blog />
        </div>
        <Footer />
      </div>
    ),
  },
  {
    path: "/blog/*",
    element: (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="container w-full md:w-2/3 flex-grow p-4">
          <h1>404 Not Found</h1>
        </div>
        <Footer />
      </div>
    ),
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
