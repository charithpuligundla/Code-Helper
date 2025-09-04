import "./home.css";
import questions from "./questions";
import Probpage from "./probpage";
import {useNavigate} from "react-router-dom";
function Home(){
    const navigate=useNavigate();
    return (
    <>
        <h1>Home Page</h1>
        <div className="problems-div">
            <div class="row header">
                <div class="cell">Status</div>
                <div class="cell">Title</div>
                <div class="cell">Acceptance</div>
                <div class="cell">Difficulty</div>
           </div>
            <div>
                {
                    questions.map((ques,index)=>{
                        return (
                            <div className="row" key={index} onClick={()=>{
                                navigate("/probpage");
                                localStorage.setItem("title",ques.title);
                                }}>
                                <div className="cell">{index+1}</div>
                                <div className="cell">{ques.title}</div>
                                <div className="cell">hello</div>
                                <div className="cell">hi</div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    </>
    );
}
export default Home;