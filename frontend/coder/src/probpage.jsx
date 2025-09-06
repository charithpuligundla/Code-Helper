import React, { useEffect, useRef, useState } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { basicSetup } from "codemirror";
import axios from 'axios';
import { autocompletion, completeFromList } from "@codemirror/autocomplete";
// JavaScript + TypeScript
import { javascript } from "@codemirror/lang-javascript";

// Python
import { python } from "@codemirror/lang-python";

// HTML
import { html } from "@codemirror/lang-html";

// CSS
import { css } from "@codemirror/lang-css";

// Java
import { java } from "@codemirror/lang-java";

// C / C++
import { cpp } from "@codemirror/lang-cpp";

// SQL
import { sql } from "@codemirror/lang-sql";

// XML
import { xml } from "@codemirror/lang-xml";

// JSON
import { json } from "@codemirror/lang-json";

// Markdown
import { markdown } from "@codemirror/lang-markdown";

// Rust
import { rust } from "@codemirror/lang-rust";

// PHP
import { php } from "@codemirror/lang-php";

import "./probpage.css";

function Probpage() {
  const editorRef = useRef(null);
  const [language,setLanguage]=useState("javascript");
  const ques=JSON.parse(localStorage.getItem("ques"))||{title:"Sample Problem"};
const myTheme = EditorView.theme({
  "&": {
    height: "100%",
    backgroundColor: "#1e1e2f",
    color: "#dcdcdc",
    fontSize: "15px",
    fontFamily: "Fira Code, monospace",
    borderRadius: "10px",
  },
  ".cm-content": {
    caretColor: "#ffcc00ff",
  },
  ".cm-gutters": {
    backgroundColor: "#1e1e2f",
    color: "#f2ff00ff",
    border: "none",
  },
  ".cm-line": {
    padding: "1px 8px",
  },
}, { dark: true });

function getLanguageExtension() {
  switch (language) {
    case "javascript": return javascript();
    case "python": return python();
    case "html": return html();
    case "css": return css();
    case "java": return java();
    case "cpp": return cpp();
    case "sql": return sql();
    case "xml": return xml();
    case "json": return json();
    case "markdown": return markdown();
    case "rust": return rust();
    case "php": return php();
    default: return javascript();
  }
}

 async function runCode() {
    if (!editorRef.current) return;
    const code = editorRef.current.querySelector(".cm-content").innerText;
    console.log("Running code:", code);
    const res=await axios.post('http://localhost:4000/run',{
      code,
      language
    });
    console.log(res.data);
    alert(res.data.output || res.data.error);
  }


  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: "console.log('Hello, CodeMirror!');",
      extensions: [basicSetup, getLanguageExtension(),myTheme,
        EditorView.updateListener.of((update) => {
      if (update.changes) {
        console.log("New code:", update.state.doc.toString());
      }
    }),
        
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    return () => view.destroy();
  }, [language]);





  return(<>
  <div className="qanda-div">
    <div className="question-div">
      <h2>Q.{ques.title}</h2>
      <p>{ques.qus}</p>
    </div>
    <div className="answer-div">
        <div className="top-bar">
  <select className="lang-sel" onChange={(e)=>{setLanguage(e.target.value)}}>
    <option value="javascript">JavaScript</option>
    <option value="cpp">C++</option>
    <option value="python" >Python</option>
    <option value="java" >Java</option>
    <option value="html">HTML</option>
    <option value="css">CSS</option>
    <option value="sql">SQL</option>
    <option value="xml">XML</option>
  </select>
  <button id="run" onClick={runCode}>RUN</button>
  </div>
      <div ref={editorRef} className="editor-div" />
    </div>
  </div>
  </>) ;
}

export default Probpage;
