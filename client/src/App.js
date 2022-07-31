import React, { Component } from 'react';
import './App.css';
// import axios from 'axios';


class App extends Component {

  state = {
    selectedFile: null
  }

  fileSelectHandler = event => {
    // console.log(event.target.files[0]);
    this.setState({
      selectedFile: event.target.files[0]
    })
  }


  fileSubmitHandler = () => {

    // Azure Cognitive Service API
    const inputText = document.querySelector('#textCount').value;
    const { AzureKeyCredential, DocumentAnalysisClient } = require("@azure/ai-form-recognizer");

    // set `<your-key>` and `<your-endpoint>` variables with the values from the Azure portal.
    const key = "69b868c2ca73495db8cbef00ef90bd32";
    const endpoint = "https://form-rec-end.cognitiveservices.azure.com/";

    // sample document
    const formUrl = this.state.selectedFile;

    async function main() {
      const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key));
      const poller = await client.beginAnalyzeDocument("prebuilt-layout", formUrl);

      const {
          pages,
          tables
      } = await poller.pollUntilDone();

      if (pages.length <= 0) {
          console.log("No pages were extracted from the document.");
      } else {
          console.log("Pages:");
          var targetCount = 0
          for (const page of pages) {
              console.log("- Page", page.pageNumber, `(unit: ${page.unit})`);
              console.log(`  ${page.width}x${page.height}, angle: ${page.angle}`);
              console.log(`  ${page.lines.length} lines, ${page.words.length} words`);
              // print file info to user
              const paraInfo = document.createElement("p");
              paraInfo.innerText = `The uploaded file contains ${page.lines.length} lines and ${page.words.length} words.`;
              document.getElementById("mainApp").appendChild(paraInfo);
              
              // count occurrence of input name
              var sentence = "";
              for (var i = 0; i < page.words.length; i++) {
                sentence += ' ' + page.words[i].content;
            }
            targetCount += sentence.trim().split(inputText).length - 1
          }
          console.log(targetCount);

          // print target count to user
          const para = document.createElement("p");
          para.innerText = `'${inputText}' was found ${targetCount} times in this file.`;
          document.getElementById("mainApp").appendChild(para);
      }

      if (tables.length <= 0) {
          console.log("No tables were extracted from the document.");
      } else {
          console.log("Tables:");
          for (const table of tables) {
              console.log(
                  `- Extracted table: ${table.columnCount} columns, ${table.rowCount} rows (${table.cells.length} cells)`
              );
          }
      }
    }

    main().catch((error) => {
        console.error("An error occurred:", error);
        process.exit(1);
    });

  }

  static insertArticle(body){
    return(
        fetch(`http://localhost:5000/add` ,{
            'method' : 'POST',
            headers : {
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify(body)
        })
        .then(resp => resp.json())
    )
  }
  
  render() {
    return (
      <div className="App" id="mainApp">
        <h1>Files Parser</h1>
        <div>
          <label>Enter word to count: </label>
          <input type="text" id="textCount" name="textCount" placeholder="enter text here"/>
        </div>
        <div>
          <label>Choose word or pdf file: </label>
          <input 
          type="file"
          id="docFile"
          name="docFile"
          onChange={this.fileSelectHandler}
          accept=".doc,.docx,.pdf,application/msword,application/pdf"/>
        </div>
        <br></br>
        <div>
          <button id="submit" onClick={this.fileSubmitHandler}>Submit</button>
        </div>
      </div>
    );
  }
}

export default App;
