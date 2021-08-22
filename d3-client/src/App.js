import TextEditor from "./components/TextEditor"
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'


function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" >
          <Redirect to={`/docs/${uuidv4()}`} />
        </Route>
        <Route path="/docs/:id" >
          <TextEditor />
        </Route>
      </Switch>
    </Router>
  );
}

export default App