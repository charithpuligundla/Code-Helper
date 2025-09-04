import App from "./App";
import ProtectedRoute from './protectedrouter';
import { Routes, Route, Link } from "react-router-dom";
import Home from "./home";
import Probpage from "./probpage";
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
        <Route path="/probpage" element={<ProtectedRoute><Probpage/></ProtectedRoute>} />
      </Routes>
        </>
    )
}
export default Start;