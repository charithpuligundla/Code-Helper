import App from "./App";
import ProtectedRoute from './protectedrouter';
import { Routes, Route, Link } from "react-router-dom";
import Home from "./home";
function Start(){
    return (
        <>
         <nav>
        <Link to="/">App</Link>
        <Link to="/home">Home</Link>
      </nav>
      <Routes>
        <Route path="/" element={<ProtectedRoute><App/></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><Home/></ProtectedRoute>} />
      </Routes>
        </>
    )
}
export default Start;