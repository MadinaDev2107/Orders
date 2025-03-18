import { Link, Route, Routes, useLocation } from "react-router-dom";
import Home from "./Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";

const App = () => {
  const location = useLocation();
  return (
    <div>
      <div className=" bg-dark  p-4 d-flex justify-content-between align-items-center">
        <Link to={"/"} style={{ textDecoration: "none", color: "white" }}>
          Logo
        </Link>
        <div className=" d-flex gap-5">
          <Link to={"/login"} className="btn btn-primary">
            Login
          </Link>
          {location.pathname === "/" && (
            <Link to={"/register"} className="btn btn-primary">
              Cabinet
            </Link>
          )}
        </div>
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
};

export default App;
