import { useState } from 'react';
import { FiAward, FiCheckCircle, FiPrinter } from 'react-icons/fi';
import { useStudent } from '../../context/StudentContext';
import { enrollmentApi } from '../../lib/api';

export default function Certificates() {
  const { enrolledCourses, loading } = useStudent();
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState('');
  const [requesting, setRequesting] = useState('');
  const completedCourses = enrolledCourses.filter((course) => course.progress === 100);

  const openCertificate = async (course) => {
    setRequesting(course.enrollmentId);
    setError('');
    try {
      const result = await enrollmentApi.certificate(course.enrollmentId);
      setCertificate(result.certificate);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setRequesting('');
    }
  };

  if (loading) return <div className="empty-state"><p>Loading certificates…</p></div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}><h1 className="page-title">Certificates</h1><p className="page-sub">Your course completion records.</p></div>
      {error && <p role="alert" style={{ color: '#b91c1c', marginBottom: '1rem' }}>{error}</p>}
      {completedCourses.length === 0 ? <div className="empty-state"><FiAward size={28} /><h2 style={{ margin: '0.75rem 0 0.35rem' }}>No certificates yet</h2><p>Complete every lesson in an enrolled course to earn a certificate.</p></div> : (
        <div className="panel">
          {completedCourses.map((course) => (
            <div key={course.enrollmentId} className="certificate-row">
              <div><h2>{course.title}</h2><p className="page-sub">Course completed · {course.progress}%</p></div>
              <button className="btn-primary" disabled={requesting === course.enrollmentId} onClick={() => openCertificate(course)}><FiAward size={16} /> {requesting === course.enrollmentId ? 'Preparing…' : 'View certificate'}</button>
            </div>
          ))}
        </div>
      )}
      {certificate && <div className="certificate-overlay" role="dialog" aria-modal="true" aria-labelledby="certificate-title">
        <div className="certificate-modal">
          <div className="certificate-print">
            <div className="certificate-mark"><FiAward size={30} /></div>
            <p className="certificate-kicker">LEARNPRO · CERTIFICATE OF COMPLETION</p>
            <h2 id="certificate-title">This certifies that</h2>
            <p className="certificate-recipient">{certificate.learnerName}</p>
            <p className="certificate-copy">has successfully completed</p>
            <p className="certificate-course">{certificate.courseTitle}</p>
            <p className="certificate-copy">Instructor: {certificate.instructorName}</p>
            <div className="certificate-meta"><span>Issued {new Date(certificate.issuedAt).toLocaleDateString()}</span><span>Verification code {certificate.code}</span></div>
          </div>
          <div className="certificate-actions"><a href={`/verify/${certificate.code}`} target="_blank" rel="noreferrer"><FiCheckCircle size={16} /> Verify certificate</a><button className="btn-primary" onClick={() => window.print()}><FiPrinter size={16} /> Print or save PDF</button><button className="btn-outline" onClick={() => setCertificate(null)}>Close</button></div>
        </div>
      </div>}
    </div>
  );
}