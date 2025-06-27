import React, { useEffect, useState } from "react";
import { Button, Table, Spinner, Dropdown, DropdownButton, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

function StudentList() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [sortAsc, setSortAsc] = useState(true);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:4000/students");
      setStudents(res.data);
      setFilteredStudents(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching students:", err);
      alert("Failed to fetch students. Please try again later.");
      setLoading(false);
    }
  };

  const deleteStudent = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this student?");
    if (!confirm) return;

    setDeleting(true);
    try {
      await axios.delete(`http://localhost:4000/students/${id}`);
      fetchStudents();
    } catch (err) {
      console.error("Error deleting student:", err);
      alert("Failed to delete student. Please try again later.");
    } finally {
      setDeleting(false);
    }
  };

  const handleSearchChange = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = students.filter((student) =>
      student.name.toLowerCase().includes(term)
    );
    setFilteredStudents(filtered);
  };

  const handleSort = (order) => {
    const sorted = [...filteredStudents].sort((a, b) => {
      return order === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });
    setFilteredStudents(sorted);
    setSortAsc(order === "asc");
  };

  const resetSearch = () => {
    setSearchTerm("");
    setFilteredStudents(students);
  };

  const handleDownload = (format) => {
    if (format === "Excel") {
      const worksheet = XLSX.utils.json_to_sheet(filteredStudents);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
      XLSX.writeFile(workbook, "StudentList.xlsx");
    } else if (format === "PDF") {
      const doc = new jsPDF();
      const tableColumn = ["Name", "Email", "Roll No"];
      const tableRows = filteredStudents.map((student) => [
        student.name,
        student.email,
        student.rollNo, // Corrected field name
      ]);

      doc.text("Student List", 14, 10);
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });
      doc.save("StudentList.pdf");
    }
  };

  return (
    <div className="wrapper">
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Student List</h2>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{
            flex: "1",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
        <Dropdown>
          <Dropdown.Toggle variant="primary" id="dropdown-basic" style={{ padding: "10px 20px" }}>
            Filter
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Form>
              <Form.Check
                type="radio"
                id="sort-asc"
                name="sortOrder"
                label="A → Z"
                checked={sortAsc}
                onChange={() => handleSort("asc")}
              />
              <Form.Check
                type="radio"
                id="sort-desc"
                name="sortOrder"
                label="Z → A"
                checked={!sortAsc}
                onChange={() => handleSort("desc")}
              />
            </Form>
          </Dropdown.Menu>
        </Dropdown>
        <Button onClick={resetSearch} style={{ padding: "10px 20px" }}>
          Reset
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center" }}>
          <Spinner animation="border" />
          <div>Loading...</div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div style={{ textAlign: "center" }}>
          <p>No students found.</p>
        </div>
      ) : (
        <>
          <Table bordered style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Roll No</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student._id}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.rollNo}</td> {/* Corrected field name */}
                  <td>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                      <Link to={`/edit-student/${student._id}`}>
                        <Button>Edit</Button>
                      </Link>
                      <Button onClick={() => deleteStudent(student._id)} disabled={deleting}>
                        {deleting ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <DropdownButton title="Download List" onSelect={(format) => handleDownload(format)} variant="success">
              <Dropdown.Item eventKey="Excel">Download as Excel</Dropdown.Item>
              <Dropdown.Item eventKey="PDF">Download as PDF</Dropdown.Item>
            </DropdownButton>
          </div>
        </>
      )}
    </div>
  );
}

export default StudentList;