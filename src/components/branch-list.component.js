import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Badge from "react-bootstrap/Badge";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Swal from "sweetalert2";

export default class BranchList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      branches: [],
      loading: true,
      error: null,
      searchTerm: ""
    };
  }

  componentDidMount() {
    this.fetchBranches();
  }

  fetchBranches = () => {
    this.setState({ loading: true });
    axios
      .get("http://localhost:4000/branches")
      .then((res) => {
        this.setState({
          branches: res.data,
          loading: false,
          error: null
        });
      })
      .catch((error) => {
        console.error("Error fetching branches:", error);
        this.setState({
          loading: false,
          error: "Failed to fetch branches"
        });
      });
  };

  deleteBranch = (id, branchName) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete "${branchName}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://localhost:4000/branches/delete/${id}`)
          .then((res) => {
            Swal.fire({
              icon: "success",
              title: "Deleted!",
              text: "Branch has been deleted successfully",
              showConfirmButton: false,
              timer: 1500
            });
            this.fetchBranches(); // Refresh the list
          })
          .catch((error) => {
            console.error("Error deleting branch:", error);
            Swal.fire({
              icon: "error",
              title: "Error!",
              text: error.response?.data?.message || "Failed to delete branch"
            });
          });
      }
    });
  };

  handleSearchChange = (event) => {
    this.setState({ searchTerm: event.target.value });
  };

  render() {
    const { branches, loading, error, searchTerm } = this.state;

    // Filter branches based on search term
    const filteredBranches = branches.filter((branch) =>
      branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
      return (
        <div className="text-center mt-4">
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
          <p>Loading branches...</p>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="danger" className="mt-4">
          <Alert.Heading>Error!</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={this.fetchBranches}>
            Try Again
          </Button>
        </Alert>
      );
    }

    return (
      <div className="table-wrapper">
        <Row className="mb-3">
          <Col md={8}>
            <h2>Branch Management</h2>
          </Col>
          <Col md={4} className="text-right">
            <Link className="btn btn-success" to="/create-branch">
              Add New Branch
            </Link>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Control
              type="text"
              placeholder="Search branches by name or code..."
              value={searchTerm}
              onChange={this.handleSearchChange}
            />
          </Col>
          <Col md={6} className="text-right">
            <Badge variant="info" className="mr-2">
              Total Branches: {filteredBranches.length}
            </Badge>
          </Col>
        </Row>

        {filteredBranches.length === 0 ? (
          <Alert variant="info">
            {searchTerm ? "No branches found matching your search." : "No branches available. Create your first branch!"}
          </Alert>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Code</th>
                <th>Branch Name</th>
                <th>Description</th>
                <th>Total Sections</th>
                <th>Total Students</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBranches.map((branch, index) => (
                <tr key={branch._id}>
                  <td>
                    <Badge variant="primary">{branch.code}</Badge>
                  </td>
                  <td>{branch.name}</td>
                  <td>{branch.description || "N/A"}</td>
                  <td>
                    <Badge variant="secondary">{branch.totalSections}</Badge>
                  </td>
                  <td>
                    <Badge variant="info">{branch.totalStudents}</Badge>
                  </td>
                  <td>
                    <Badge variant={branch.isActive ? "success" : "danger"}>
                      {branch.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td>
                    <Link
                      className="btn btn-primary btn-sm me-2"
                      to={`/edit-branch/${branch._id}`}
                    >
                      Edit
                    </Link>
                    <Link
                      className="btn btn-info btn-sm me-2"
                      to={`/sections/branch/${branch._id}`}
                    >
                      Sections
                    </Link>
                    <Button
                      className="btn btn-danger btn-sm"
                      onClick={() => this.deleteBranch(branch._id, branch.name)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    );
  }
}
