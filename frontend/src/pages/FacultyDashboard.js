import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { subjectsAPI, projectsAPI } from '../services/api';
import logo from '../assets/logos/logo.png';
import './Dashboard.css';

const FacultyDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [subjects, setSubjects] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showCreateSubject, setShowCreateSubject] = useState(false);
  const [evaluatingProject, setEvaluatingProject] = useState(null);

  // Form states
  const [subjectForm, setSubjectForm] = useState({
    subjectCode: '',
    subjectName: '',
    description: '',
    department: '',
    credits: 3,
    maxStudents: 50
  });

  const [evaluationForm, setEvaluationForm] = useState({
    marks: '',
    facultyFeedback: '',
    innovation: '',
    functionality: '',
    documentation: '',
    presentation: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subjectsRes, projectsRes] = await Promise.all([
        subjectsAPI.getFacultySubjects(),
        projectsAPI.getFacultyProjects()
      ]);
      
      setSubjects(subjectsRes.data.data || []);
      setProjects(projectsRes.data.data || []);
    } catch (error) {
      setMessage('Error loading data');
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const createSubject = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await subjectsAPI.createSubject(subjectForm);
      setMessage('Subject created successfully!');
      setShowCreateSubject(false);
      setSubjectForm({
        subjectCode: '',
        subjectName: '',
        description: '',
        department: user.department,
        credits: 3,
        maxStudents: 50
      });
      loadData(); // Reload data
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error creating subject');
    }
    setLoading(false);
  };

  const evaluateProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const evaluationData = {
        marks: parseInt(evaluationForm.marks),
        facultyFeedback: evaluationForm.facultyFeedback,
        evaluationCriteria: {
          innovation: parseInt(evaluationForm.innovation) || 0,
          functionality: parseInt(evaluationForm.functionality) || 0,
          documentation: parseInt(evaluationForm.documentation) || 0,
          presentation: parseInt(evaluationForm.presentation) || 0
        }
      };

      await projectsAPI.evaluateProject(evaluatingProject._id, evaluationData);
      setMessage('Project evaluated successfully!');
      setEvaluatingProject(null);
      setEvaluationForm({
        marks: '',
        facultyFeedback: '',
        innovation: '',
        functionality: '',
        documentation: '',
        presentation: ''
      });
      loadData(); // Reload data
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error evaluating project');
    }
    setLoading(false);
  };

  const startEvaluation = (project) => {
    setEvaluatingProject(project);
    setEvaluationForm({
      marks: project.marks || '',
      facultyFeedback: project.facultyFeedback || '',
      innovation: project.evaluationCriteria?.innovation || '',
      functionality: project.evaluationCriteria?.functionality || '',
      documentation: project.evaluationCriteria?.documentation || '',
      presentation: project.evaluationCriteria?.presentation || ''
    });
  };

  const renderOverview = () => (
    <div className="dashboard-section">
      <h3>Faculty Overview</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <h4>My Subjects</h4>
          <p className="stat-number">{subjects.length}</p>
        </div>
        <div className="stat-card">
          <h4>Total Projects</h4>
          <p className="stat-number">{projects.length}</p>
        </div>
        <div className="stat-card">
          <h4>Pending Evaluation</h4>
          <p className="stat-number">
            {projects.filter(p => p.status === 'submitted').length}
          </p>
        </div>
        <div className="stat-card">
          <h4>Evaluated</h4>
          <p className="stat-number">
            {projects.filter(p => p.status === 'evaluated').length}
          </p>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h4>Recent Project Submissions</h4>
        {projects.slice(0, 5).map(project => (
          <div key={project._id} className="project-item">
            <strong>{project.projectTitle}</strong> - {project.subjectCode}
            <span className={`status-badge ${project.status}`}>
              {project.status.replace('_', ' ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSubjects = () => (
    <div className="dashboard-section">
      <div className="section-header">
        <h3>My Subjects</h3>
        <button 
          onClick={() => setShowCreateSubject(true)}
          className="create-btn"
        >
          + Create New Subject
        </button>
      </div>

      {showCreateSubject && (
        <div className="form-card">
          <h4>Create New Subject</h4>
          <form onSubmit={createSubject}>
            <div className="form-row">
              <div className="form-group">
                <label>Subject Code:</label>
                <input
                  type="text"
                  value={subjectForm.subjectCode}
                  onChange={(e) => setSubjectForm({...subjectForm, subjectCode: e.target.value})}
                  required
                  placeholder="e.g., CS101"
                />
              </div>
              <div className="form-group">
                <label>Subject Name:</label>
                <input
                  type="text"
                  value={subjectForm.subjectName}
                  onChange={(e) => setSubjectForm({...subjectForm, subjectName: e.target.value})}
                  required
                  placeholder="e.g., Introduction to Programming"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Description:</label>
              <textarea
                value={subjectForm.description}
                onChange={(e) => setSubjectForm({...subjectForm, description: e.target.value})}
                placeholder="Subject description..."
                rows="3"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Credits:</label>
                <input
                  type="number"
                  value={subjectForm.credits}
                  onChange={(e) => setSubjectForm({...subjectForm, credits: parseInt(e.target.value)})}
                  min="1"
                  max="10"
                />
              </div>
              <div className="form-group">
                <label>Max Students:</label>
                <input
                  type="number"
                  value={subjectForm.maxStudents}
                  onChange={(e) => setSubjectForm({...subjectForm, maxStudents: parseInt(e.target.value)})}
                  min="1"
                  max="100"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Subject'}
              </button>
              <button type="button" onClick={() => setShowCreateSubject(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading subjects...</p>
      ) : subjects.length === 0 ? (
        <p>No subjects created yet. Create your first subject!</p>
      ) : (
        <div className="subjects-grid">
          {subjects.map(subject => (
            <div key={subject._id} className="subject-card">
              <h4>{subject.subjectName}</h4>
              <p><strong>Code:</strong> {subject.subjectCode}</p>
              <p><strong>Description:</strong> {subject.description}</p>
              <p><strong>Credits:</strong> {subject.credits}</p>
              <p><strong>Enrolled Students:</strong> {subject.enrolledStudents?.length || 0}/{subject.maxStudents}</p>
              <p><strong>Department:</strong> {subject.department}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProjects = () => (
    <div className="dashboard-section">
      <h3>Student Projects</h3>
      
      {evaluatingProject && (
        <div className="evaluation-modal">
          <div className="modal-content">
            <h4>Evaluate Project: {evaluatingProject.projectTitle}</h4>
            <form onSubmit={evaluateProject}>
              <div className="form-group">
                <label>Marks (0-100):</label>
                <input
                  type="number"
                  value={evaluationForm.marks}
                  onChange={(e) => setEvaluationForm({...evaluationForm, marks: e.target.value})}
                  min="0"
                  max="100"
                  required
                />
              </div>
              
              <div className="criteria-grid">
                <div className="form-group">
                  <label>Innovation (0-25):</label>
                  <input
                    type="number"
                    value={evaluationForm.innovation}
                    onChange={(e) => setEvaluationForm({...evaluationForm, innovation: e.target.value})}
                    min="0"
                    max="25"
                  />
                </div>
                <div className="form-group">
                  <label>Functionality (0-25):</label>
                  <input
                    type="number"
                    value={evaluationForm.functionality}
                    onChange={(e) => setEvaluationForm({...evaluationForm, functionality: e.target.value})}
                    min="0"
                    max="25"
                  />
                </div>
                <div className="form-group">
                  <label>Documentation (0-25):</label>
                  <input
                    type="number"
                    value={evaluationForm.documentation}
                    onChange={(e) => setEvaluationForm({...evaluationForm, documentation: e.target.value})}
                    min="0"
                    max="25"
                  />
                </div>
                <div className="form-group">
                  <label>Presentation (0-25):</label>
                  <input
                    type="number"
                    value={evaluationForm.presentation}
                    onChange={(e) => setEvaluationForm({...evaluationForm, presentation: e.target.value})}
                    min="0"
                    max="25"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Feedback:</label>
                <textarea
                  value={evaluationForm.facultyFeedback}
                  onChange={(e) => setEvaluationForm({...evaluationForm, facultyFeedback: e.target.value})}
                  placeholder="Provide feedback to the student..."
                  rows="4"
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Evaluation'}
                </button>
                <button type="button" onClick={() => setEvaluatingProject(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <p>No projects submitted yet.</p>
      ) : (
        <div className="projects-list">
          {projects.map(project => (
            <div key={project._id} className="project-card">
              <div className="project-header">
                <h4>{project.projectTitle}</h4>
                <span className={`status-badge ${project.status}`}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="project-details">
                <p><strong>Student:</strong> {project.studentName} ({project.studentEmail})</p>
                <p><strong>Subject:</strong> {project.subjectCode}</p>
                <p><strong>Submitted:</strong> {new Date(project.submissionDate).toLocaleDateString()}</p>
                <p><strong>Description:</strong> {project.description}</p>
                <p><strong>File:</strong> {project.fileName} ({(project.fileSize / 1024 / 1024).toFixed(2)} MB)</p>
                
                {project.status === 'evaluated' && (
                  <div className="evaluation-details">
                    <h5>Evaluation Results:</h5>
                    <p><strong>Marks:</strong> {project.marks}/100</p>
                    <p><strong>Feedback:</strong> {project.facultyFeedback}</p>
                    {project.evaluationCriteria && (
                      <div className="criteria-grid-small">
                        <span>Innovation: {project.evaluationCriteria.innovation}/25</span>
                        <span>Functionality: {project.evaluationCriteria.functionality}/25</span>
                        <span>Documentation: {project.evaluationCriteria.documentation}/25</span>
                        <span>Presentation: {project.evaluationCriteria.presentation}/25</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="project-actions">
                <a href={`${process.env.BASE_URL}/${project.fileUrl}`} target="_blank" rel="noopener noreferrer" className="view-btn">
                  View File
                </a>
                {project.status !== 'evaluated' && (
                  <button 
                    onClick={() => startEvaluation(project)}
                    className="evaluate-btn"
                  >
                    Evaluate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="dashboard-container">
      <nav className="navbar">
  <div className="nav-content">
    <div className="brand">
      <img src={logo} alt="Logo" className="brand-logo" />
      <span className="brand-text">Projects Portal - {user?.role}</span>
    </div>
    <div className="nav-links">
      <span>Welcome, {user?.username}</span>
      <button onClick={logout} className="btn btn-danger">Logout</button>
    </div>
  </div>
</nav>

      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'subjects' ? 'active' : ''}
          onClick={() => setActiveTab('subjects')}
        >
          My Subjects
        </button>
        <button 
          className={activeTab === 'projects' ? 'active' : ''}
          onClick={() => setActiveTab('projects')}
        >
          Student Projects
        </button>
      </div>

      <div className="dashboard-content">
        {message && (
          <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'subjects' && renderSubjects()}
        {activeTab === 'projects' && renderProjects()}
      </div>
    </div>
  );
};

export default FacultyDashboard;