import './App.css'
import { githubProvider, googleProvider } from './firebase';
import { useState,useEffect} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ProtectedRoute from './protectedrouter';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signInWithRedirect, 
  signOut,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink 
} from "firebase/auth";
import { auth } from "./firebase"; 
import { Routes, Route, Link } from "react-router-dom";
import Home from './home';

function App() {
  const [user, setUser] = useState(null);
  const [step,setstep] = useState("email");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [otp,setOtp] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u ?? null);
      setLoading(false);  
    });
    return () => unsub();
  }, []);

// const actionCodeSettings = {
//   url: "http://localhost:5173/home",
//   handleCodeInApp: true,
// };

// const sendLoginLink = async (e) => {
//     e.preventDefault();
//     try {
//       await sendSignInLinkToEmail(auth, email, actionCodeSettings);
//       window.localStorage.setItem("emailForSignIn", email);
//       alert("Login link sent! Please check your email.");
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   // Step 2: Auto-login when redirected back
//   useEffect(() => {
//     if (isSignInWithEmailLink(auth, window.location.href)) {
//       let savedEmail = window.localStorage.getItem("emailForSignIn");

//       // If email not saved (user opens link on different device)
//       if (!savedEmail) {
//         savedEmail = window.prompt("Please enter your email for verification");
//       }

//       signInWithEmailLink(auth, savedEmail, window.location.href)
//         .then(() => {
//           alert("✅ Login successful!");
//           window.localStorage.removeItem("emailForSignIn");
//         })
//         .catch((err) => {
//           alert(err.message);
//         });
//     }
//   }, []);

  // const signupEmail = async (e) => {
  //   e.preventDefault();
  //   setErr("");
  //   try {
  //     await createUserWithEmailAndPassword(auth, email, password);
  //   } catch (e) {
  //     setErr(e.message);
  //   }
  // };

  // const loginEmail = async () => {
  //   setErr("");
  //   try {
  //     await signInWithEmailAndPassword(auth, email, password);
  //   } catch (e) {
  //     setErr(e.message);
  //   }
  // };

  const loginWith = async (provider) => {
    setErr("");
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      if (e?.code === "auth/popup-blocked") {
        await signInWithRedirect(auth, provider);
      } else {
        setErr(e.message);
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  if (loading) return <div style={{ padding: 24 }}>Checking session…</div>;
  
  async function sendotp(e){
    e.preventDefault();
    console.log("otp pre sent");
    await axios.post("http://localhost:4000/send-otp",{email});
    console.log("otp sent");
    setstep("otp");
  }
  async function verifyotp(){
    try{
      const res=await axios.post("http://localhost:4000/verify-otp",{email,otp});
    alert(res.data.message);
    localStorage.setItem("token",res.data.token);
    }
    catch(err){
      alert(err.res.data.error);
    }
    navigate("/home");
  }

        function togglepass(){
            if(document.getElementById('password').type === "password"){
                document.getElementById('password').type = "text";
                document.querySelector('.toggle-password').innerHTML='<i class="fa-solid fa-eye-slash"></i>';
        }
        else{
                document.getElementById('password').type = "password";
                document.querySelector('.toggle-password').innerHTML = '<i class="fa-solid fa-eye"></i>';
        }
    }
    function toggleconform(){
            if(document.getElementById('conformPassword').type === "password"){
                document.getElementById('conformPassword').type = "text";
                document.querySelector('.toggle-conformpassword').innerHTML='<i class="fa-solid fa-eye-slash"></i>';
        }
        else{
                document.getElementById('conformPassword').type = "password";
                document.querySelector('.toggle-conformpassword').innerHTML = '<i class="fa-solid fa-eye"></i>';
        }
    }
  return (
    <>
      <nav>
        <Link to="/home">Home</Link>
      </nav>
      <Routes>
        <Route path="/home" element={<ProtectedRoute><Home/></ProtectedRoute>} />
      </Routes>
      {step === "email" && (<>
      <h1>login</h1>
      <form className="login-form">
        <label htmlFor="username">username : </label>
        <input type="text" id="username" required />
        <br />
        
        <label htmlFor="password">password : </label>
        <input type="password" id="password" required onChange={(e)=>setPassword(e.target.value)}/>
        <div className="password-div">
          <span className="toggle-password" onClick={togglepass}>
            <i className="fa-solid fa-eye"></i>
          </span>
        </div>
        <br />
        
        <label htmlFor="conformPassword">conform password : </label>
        <input type="password" id="conformPassword" required />
        <div className="password-div">
          <span className="toggle-conformpassword" onClick={toggleconform}>
            <i className="fa-solid fa-eye"></i>
          </span>
        </div>
        <br />
        
        <label htmlFor="email">email : </label>
        <input type="email" id="email" required onChange={(e)=>setEmail(e.target.value)}/>
        <br />
        <button type="submit" onClick={sendotp}>submit</button>
      </form>
      
      <p>if already login? please <a href="">signup</a></p>
      <p>or you can login with</p>
      <div className="login-option-div">
        <i className="fa-brands fa-google" onClick={() => loginWith(googleProvider)}></i>
        <i className="fa-brands fa-github" onClick={() => loginWith(githubProvider)}></i>
        <i className="fa-brands fa-facebook"></i>
        <i className="fa-brands fa-linkedin"></i>
      </div>
      </>)}
      {step === "otp" && (
        <>
          <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" />
          <button onClick={verifyotp}>Verify OTP</button>
        </>
      )}
    </>
  )
}

export default App
