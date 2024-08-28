import { createHashRouter, RouterProvider } from "react-router-dom";
import Home from "@/pages/Home";
import Blog from "@/pages/Blog";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "./components/ui/button";
import { BiLeftArrow } from "react-icons/bi";

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
    path: "/blogpost/:id",
    element: (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex w-screen flex-grow p-4 flex-col sm:flex-row justify-center">
          <Button
            variant="ghost"
            className="justify-start hover:bg-slate-950 hover:text-lg hover:transition-all pt-10"
            onClick={() => {
              window.location.href = "/blog/";
            }}
          >
            <BiLeftArrow className="mr-2" /> Go Back
          </Button>
          <Blog />
        </div>
        <Footer />
      </div>
    ),
  },
  {
    path: "/*",
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
