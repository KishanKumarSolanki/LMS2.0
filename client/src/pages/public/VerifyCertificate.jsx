import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { enrollmentApi } from '../../lib/api';

export default function VerifyCertificate() {
  const { code } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    enrollmentApi.verifyCertificate(code)
      .then(({ certificate: result }) => { if (active) setCertificate(result); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [code]);

  return (
    <main className="certificate-verify-page">
      <Link to="/" className="btn-ghost"><FiArrowLeft size={15} /> LearnPro</Link>
      <section className="certificate-verify-panel">
        {loading ? <p>Checking certificate…</p> : certificate ? <>
          <FiCheckCircle size={38} style={{ color: '#047857' }} />
          <p className="certificate-kicker">CERTIFICATE VERIFIED</p>
          <h1>{certificate.learnerName}</h1>
          <p>Completed <strong>{certificate.courseTitle}</strong></p>
          <p>Instructor: {certificate.instructorName}</p>
          <p>Issued {new Date(certificate.issuedAt).toLocaleDateString()}</p>
          <small>Verification code: {certificate.code}</small>
        </> : <>
          <FiXCircle size={38} style={{ color: '#b91c1c' }} />
          <h1>Certificate not found</h1>
          <p>{error || 'This verification code is not valid.'}</p>
        </>}
      </section>
    </main>
  );
}