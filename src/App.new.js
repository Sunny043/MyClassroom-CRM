import React, { useState, useEffect } from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import { BrowserRouter as Router, Switch, Route, Link, Redirect } from "react-router-dom";
import axios from "axios";

import Login from "./components/Login.component";
import CreateStudent from "./components/create-student.component";
import EditStudent from "./components/edit-student.component";
import StudentList from "./components/student-list.component";
import BranchManagement from "./components/BranchManagement.component";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        // Set axios default header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="App">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Navbar expand="md" className="shadow-sm">
            <Container>
              <Navbar.Brand>
                <Link to="/dashboard" className="nav-link text-primary fw-bold">
                  My Class Room
                </Link>
              </Navbar.Brand>
              
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                  <Nav.Link as={Link} to="/create-student">
                    Create Student
                  </Nav.Link>
                  <Nav.Link as={Link} to="/student-list">
                    Students
                  </Nav.Link>
                  {user.role === "admin" && (
                    <Nav.Link as={Link} to="/branch-management">
                      Branches
                    </Nav.Link>
                  )}
                </Nav>
                
                <Nav className="ms-auto">
                  <Navbar.Text className="me-3">
                    Welcome, <strong>{user.fullName}</strong>
                    {user.role === "coordinator" && user.branch && (
                      <span className="text-muted"> ({user.branch.name})</span>
                    )}
                  </Navbar.Text>
                  <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </header>

        <Container fluid className="mt-4">
          <Row>
            <Col>
              <Switch>
                {/* Dashboard */}
                <Route exact path="/">
                  <Redirect to="/dashboard" />
                </Route>
                
                <Route path="/dashboard">
                  <div className="text-center py-5">
                    <h2>Welcome to My Class Room</h2>
                    <p className="lead">Student Management System</p>
                    <div className="mt-4">
                      <Link to="/create-student" className="btn btn-primary me-3">
                        Create New Student
                      </Link>
                      <Link to="/student-list" className="btn btn-outline-primary">
                        View All Students
                      </Link>
                    </div>
                  </div>
                </Route>

                {/* Student Routes */}
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

                {/* Branch Management (Admin only) */}
                {user.role === "admin" && (
                  <Route path="/branch-management" component={BranchManagement} />
                )}

                {/* Fallback */}
                <Route>
                  <Redirect to="/dashboard" />
                </Route>
              </Switch>
            </Col>
          </Row>
        </Container>
      </div>
    </Router>
  );
}

export default App;
