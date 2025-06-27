import React from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import CreateStudent from "./components/create-student.component";
import EditStudent from "./components/edit-student.component";
import StudentList from "./components/student-list.component";
import CreateBranch from "./components/create-branch.component";
import BranchList from "./components/branch-list.component";
import CreateSection from "./components/create-section.component";
import SectionList from "./components/section-list.component";

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Navbar expand="md">
            <Container>
              <Navbar.Brand>
                <Link to={"/create-student"} className="nav-link">
                  My Class Room
                </Link>
              </Navbar.Brand>
              <Nav className="justify-content-end">
                <Nav>
                  <Link to={"/create-student"} className="nav-link">
                    Create Student
                  </Link>
                </Nav>
                <Nav>
                  <Link to={"/student-list"} className="nav-link">
                    Students
                  </Link>
                </Nav>
                <Nav>
                  <Link to={"/branch-list"} className="nav-link">
                    Branches
                  </Link>
                </Nav>
                <Nav>
                  <Link to={"/section-list"} className="nav-link">
                    Sections
                  </Link>
                </Nav>
              </Nav>
            </Container>
          </Navbar>
        </header>

        <Container>
          <Row>
            <Col md={12}>
              <Switch>
                {/* Student Routes */}
                <Route exact path="/" component={CreateStudent} />
                <Route path="/create-student" component={CreateStudent} />
                <Route path="/edit-student/:id" component={EditStudent} />
                <Route
                  path="/student-list"
                  render={() => (
                    <div className="wrapper">
                      <StudentList />
                    </div>
                  )}
                />

                {/* Branch Routes */}
                <Route path="/create-branch" component={CreateBranch} />
                <Route
                  path="/branch-list"
                  render={() => (
                    <div className="wrapper">
                      <BranchList />
                    </div>
                  )}
                />

                {/* Section Routes */}
                <Route path="/create-section" component={CreateSection} />
                <Route
                  path="/section-list"
                  render={() => (
                    <div className="wrapper">
                      <SectionList />
                    </div>
                  )}
                />
              </Switch>
            </Col>
          </Row>
        </Container>
      </div>
    </Router>
  );
}

export default App;