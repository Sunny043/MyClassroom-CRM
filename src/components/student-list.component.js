import React, { useEffect, useState, useCallback } from "react";
import { Button, Table, Spinner, Dropdown, DropdownButton } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

function StudentList() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("name"); // New state for search field
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [sortField, setSortField] = useState("name"); // New state for sort field
  const [sortOrder, setSortOrder] = useState("asc"); // New state for sort order
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:4000/students/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching students:", err);
      alert("Failed to fetch students. Please try again later.");
      setLoading(false);
    }
  };

  const filterAndSortStudents = useCallback((term, field, sortFieldParam, sortOrderParam) => {
    let filtered = students;

    // Filter based on search term and field
    if (term) {
      filtered = students.filter((student) => {
        const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
        switch (field) {
          case "name":
            return fullName.includes(term);
          case "email":
            return student.email.toLowerCase().includes(term);
          case "rollNo":
            return student.rollNo.toLowerCase().includes(term);
          case "all":
            return (
              fullName.includes(term) ||
              student.email.toLowerCase().includes(term) ||
              student.rollNo.toLowerCase().includes(term)
            );
          default:
            return fullName.includes(term);
        }
      });
    }

    // Sort the filtered results
    const sorted = [...filtered].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortFieldParam) {
        case "name":
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case "email":
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case "rollNo":
          aValue = a.rollNo.toLowerCase();
          bValue = b.rollNo.toLowerCase();
          break;
        case "createdAt":
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
      }

      if (sortOrderParam === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredStudents(sorted);
  }, [students]);

  useEffect(() => {
    if (students.length > 0) {
      filterAndSortStudents(searchTerm, searchField, sortField, sortOrder);
    } else {
      setFilteredStudents([]);
    }
  }, [students, searchTerm, searchField, sortField, sortOrder, filterAndSortStudents]);

  const deleteStudent = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this student?");
    if (!confirm) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:4000/students/delete-student/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStudents();
      alert("Student deleted successfully!");
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
    filterAndSortStudents(term, searchField, sortField, sortOrder);
  };

  const handleSearchFieldChange = (field) => {
    setSearchField(field);
    filterAndSortStudents(searchTerm, field, sortField, sortOrder);
  };

  const handleSort = (field, order) => {
    setSortField(field);
    setSortOrder(order);
    filterAndSortStudents(searchTerm, searchField, field, order);
  };

  const resetSearch = () => {
    setSearchTerm("");
    setSearchField("name");
    setSortField("name");
    setSortOrder("asc");
    setFilteredStudents(students);
  };

  const handleDownload = (format) => {
    try {
      console.log(`Starting ${format} export for ${filteredStudents.length} students`);
      
      if (filteredStudents.length === 0) {
        alert("No students to export. Please make sure students are loaded.");
        return;
      }

      if (format === "Excel") {
      // Prepare data for Excel with comprehensive student information
      const dataForExport = filteredStudents.map(student => {
        // Handle both old and new name formats
        const fullName = student.firstName && student.lastName 
          ? `${student.firstName} ${student.lastName}`
          : student.fullName || student.name || 'N/A';
          
        return {
          'Full Name': fullName,
          'First Name': student.firstName || '',
          'Last Name': student.lastName || '',
          'Email': student.email || '',
          'Phone': student.phone || '',
          'Student ID': student.studentId || '',
          'Roll Number': student.rollNo || '',
          'Branch': student.branchId?.name || student.branchId?.code || '',
          'Section': student.sectionName || '',
          'Year': student.year || '',
          'Semester': student.semester || '',
          'Academic Year': student.academicYear || '',
          'Gender': student.gender || '',
          'Date of Birth': student.dateOfBirth 
            ? new Date(student.dateOfBirth).toLocaleDateString('en-US')
            : '',
          'Blood Group': student.bloodGroup || '',
          'Guardian Name': student.guardianName || '',
          'Guardian Phone': student.guardianPhone || '',
          'Address': student.address?.city && student.address?.state 
            ? `${student.address.city}, ${student.address.state}`
            : '',
          'Status': student.status || 'Active',
          'Admission Date': student.admissionDate 
            ? new Date(student.admissionDate).toLocaleDateString('en-US')
            : '',
          'Created Date': student.createdAt 
            ? new Date(student.createdAt).toLocaleDateString('en-US')
            : 'N/A',
          'Last Updated': student.updatedAt 
            ? new Date(student.updatedAt).toLocaleDateString('en-US')
            : 'N/A'
        };
      });
      
      const worksheet = XLSX.utils.json_to_sheet(dataForExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
      XLSX.writeFile(workbook, `StudentList_${new Date().toISOString().split('T')[0]}.xlsx`);
      
    } else if (format === "PDF") {
      const doc = new jsPDF();
      
      // Add title and metadata
      doc.setFontSize(18);
      doc.text("Student List Report", 14, 15);
      
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-US')}`, 14, 25);
      doc.text(`Total Students: ${students.length}`, 14, 32);
      doc.text(`Filtered Results: ${filteredStudents.length}`, 14, 39);
      
      if (searchTerm) {
        doc.text(`Search Term: "${searchTerm}" in ${searchField}`, 14, 46);
      }
      
      doc.text(`Sorted by: ${sortField} (${sortOrder})`, 14, 53);
      
      // Create a simple text-based student list
      let yPosition = 65;
      doc.setFontSize(12);
      doc.text("Student List:", 14, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      
      // Add header
      doc.text("Name", 14, yPosition);
      doc.text("Email", 80, yPosition);
      doc.text("Roll No", 140, yPosition);
      doc.text("Branch", 170, yPosition);
      yPosition += 5;
      
      // Add line separator
      doc.line(14, yPosition, 200, yPosition);
      yPosition += 5;
      
      // Add student data (limit to prevent page overflow)
      const studentsToShow = filteredStudents.slice(0, 25); // Show max 25 students
      
      studentsToShow.forEach((student) => {
        const fullName = student.firstName && student.lastName 
          ? `${student.firstName} ${student.lastName}`
          : student.fullName || student.name || 'N/A';
          
        doc.text(fullName.substring(0, 22), 14, yPosition);
        doc.text((student.email || '').substring(0, 30), 80, yPosition);
        doc.text(student.rollNo || '', 140, yPosition);
        doc.text((student.branchId?.name || '').substring(0, 15), 170, yPosition);
        yPosition += 6;
        
        // Add new page if needed
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
          doc.setFontSize(10);
        }
      });
      
      // Add footer if there are more students
      if (filteredStudents.length > 25) {
        yPosition += 10;
        doc.setFontSize(8);
        doc.text(`Note: Showing first 25 students of ${filteredStudents.length} total. Export to Excel for complete list.`, 14, yPosition);
      }
      
      doc.save(`StudentList_${new Date().toISOString().split('T')[0]}.pdf`);
    }
    
    console.log(`${format} export completed successfully`);
    alert(`${format} file downloaded successfully!`);
    
    } catch (error) {
      console.error(`Error during ${format} export:`, error);
      alert(`Failed to export ${format} file. Please try again. Error: ${error.message}`);
    }
  };

  return (
    <div className="wrapper">
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Student List</h2>
      
      {/* Statistics Bar */}
      <div style={{ 
        background: "linear-gradient(135deg, #667eea, #764ba2)", 
        color: "white", 
        padding: "15px", 
        borderRadius: "10px", 
        marginBottom: "20px",
        display: "flex",
        justifyContent: "space-around",
        flexWrap: "wrap"
      }}>
        <div style={{ textAlign: "center" }}>
          <strong>{students.length}</strong>
          <div style={{ fontSize: "0.9rem" }}>Total Students</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <strong>{filteredStudents.length}</strong>
          <div style={{ fontSize: "0.9rem" }}>Showing</div>
        </div>
        {searchTerm && (
          <div style={{ textAlign: "center" }}>
            <strong>"{searchTerm}"</strong>
            <div style={{ fontSize: "0.9rem" }}>Search Term</div>
          </div>
        )}
      </div>

      <div className="search-filter-section">
        <div style={{ display: "flex", gap: "10px", flex: 1 }}>
          <input
            type="text"
            placeholder={`Search by ${searchField === 'all' ? 'any field' : searchField}...`}
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ flex: 1 }}
          />
          <Dropdown>
            <Dropdown.Toggle variant="info" id="search-field-dropdown">
              Search in: {searchField === 'all' ? 'All Fields' : searchField.charAt(0).toUpperCase() + searchField.slice(1)}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleSearchFieldChange("all")}>
                All Fields
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleSearchFieldChange("name")}>
                Name
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleSearchFieldChange("email")}>
                Email
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleSearchFieldChange("rollNo")}>
                Roll Number
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        
        <Dropdown>
          <Dropdown.Toggle variant="primary" id="sort-dropdown">
            Sort by: {sortField.charAt(0).toUpperCase() + sortField.slice(1)} ({sortOrder.toUpperCase()})
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Header>Sort by Name</Dropdown.Header>
            <Dropdown.Item onClick={() => handleSort("name", "asc")}>
              Name (A → Z)
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleSort("name", "desc")}>
              Name (Z → A)
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Header>Sort by Email</Dropdown.Header>
            <Dropdown.Item onClick={() => handleSort("email", "asc")}>
              Email (A → Z)
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleSort("email", "desc")}>
              Email (Z → A)
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Header>Sort by Roll Number</Dropdown.Header>
            <Dropdown.Item onClick={() => handleSort("rollNo", "asc")}>
              Roll No (Low → High)
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleSort("rollNo", "desc")}>
              Roll No (High → Low)
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Header>Sort by Date</Dropdown.Header>
            <Dropdown.Item onClick={() => handleSort("createdAt", "desc")}>
              Newest First
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleSort("createdAt", "asc")}>
              Oldest First
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        
        <Button onClick={resetSearch} variant="secondary">
          Reset All
        </Button>
      </div>

      {/* Quick Filter Buttons */}
      <div style={{ 
        display: "flex", 
        gap: "10px", 
        marginBottom: "20px", 
        flexWrap: "wrap",
        justifyContent: "center"
      }}>
        <Button 
          variant="outline-primary" 
          size="sm"
          onClick={() => {
            setSearchTerm("");
            handleSort("name", "asc");
          }}
        >
          📝 Name A-Z
        </Button>
        <Button 
          variant="outline-success" 
          size="sm"
          onClick={() => {
            setSearchTerm("");
            handleSort("createdAt", "desc");
          }}
        >
          📅 Newest First
        </Button>
        <Button 
          variant="outline-info" 
          size="sm"
          onClick={() => {
            setSearchTerm("");
            handleSort("rollNo", "asc");
          }}
        >
          🔢 Roll No Low-High
        </Button>
        <Button 
          variant="outline-warning" 
          size="sm"
          onClick={() => {
            setSearchTerm("");
            handleSort("email", "asc");
          }}
        >
          📧 Email A-Z
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center" }}>
          <Spinner animation="border" />
          <div>Loading...</div>
        </div>
      ) : filteredStudents.length === 0 && searchTerm ? (
        <div style={{ 
          textAlign: "center", 
          padding: "40px",
          background: "linear-gradient(145deg, #fff3cd, #ffeaa7)",
          borderRadius: "15px",
          border: "1px solid #ffc107"
        }}>
          <h4>🔍 No Results Found</h4>
          <p>No students found matching "{searchTerm}" in {searchField === 'all' ? 'any field' : searchField}.</p>
          <Button onClick={resetSearch} variant="warning">
            Clear Search
          </Button>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div style={{ 
          textAlign: "center",
          padding: "40px",
          background: "linear-gradient(145deg, #d1ecf1, #bee5eb)",
          borderRadius: "15px",
          border: "1px solid #17a2b8"
        }}>
          <h4>📚 No Students Yet</h4>
          <p>Start by adding your first student to the classroom!</p>
          <Link to="/create-student">
            <Button variant="info">Add First Student</Button>
          </Link>
        </div>
      ) : (
        <>
          <Table bordered responsive className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Roll No</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student._id}>
                  <td>{`${student.firstName} ${student.lastName}`}</td>
                  <td>{student.email}</td>
                  <td>{student.rollNo}</td>
                  <td>
                    {student.createdAt 
                      ? new Date(student.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : 'N/A'
                    }
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                      <Link to={`/edit-student/${student._id}`}>
                        <Button variant="primary" size="sm">Edit</Button>
                      </Link>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => deleteStudent(student._id)} 
                        disabled={deleting}
                      >
                        {deleting ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <DropdownButton 
              title="Download List" 
              onSelect={(format) => handleDownload(format)} 
              variant="success"
            >
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