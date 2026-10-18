import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowDown, FiArrowLeft, FiArrowUp, FiBookOpen, FiCheckCircle, FiDollarSign, FiImage, FiPlus, FiSave, FiTrash2, FiUpload, FiVideo } from 'react-icons/fi';
import { courseApi } from '../../lib/api';

const blankCourse = {
  title: '',
  shortDescription: '',
  category: '',
  level: 'Beginner',
  duration: '',
  price: '',
  description: '',
  thumbnail: '',
  isShort: false,
};

const blankLesson = () => ({ id: '', title: '', description: '', videoUrl: '', resourcesText: '' });

function lessonFormValue(lesson) {
  return {
    id: lesson._id || '',
    title: lesson.title || '',
    description: lesson.description || '',
    videoUrl: lesson.videoUrl || '',
    resourcesText: (lesson.resources || []).map((resource) => `${resource.title || ''} | ${resource.url}`).join('\n'),
  };
}

function lessonPayload(lesson) {
  const resources = lesson.resourcesText.split('\n').map((item) => item.trim()).filter(Boolean).map((item, index) => {
    const separator = item.indexOf('|');
    return separator === -1
      ? { title: `Resource ${index + 1}`, url: item }
      : { title: item.slice(0, separator).trim() || `Resource ${index + 1}`, url: item.slice(separator + 1).trim() };
  });

  return {
    ...(lesson.id ? { _id: lesson.id } : {}),
    title: lesson.title.trim(),
    description: lesson.description.trim(),
    videoUrl: lesson.videoUrl.trim(),
    resources,
  };
}

export default function CreateCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(blankCourse);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [savingAction, setSavingAction] = useState('');
  const [error, setError] = useState('');

  useEffect(() => () => {
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
  }, [thumbnailPreview]);

  useEffect(() => {
    if (!id) return;
    courseApi.get(id)
      .then(({ course }) => {
        setForm({
          title: course.title || '',
          shortDescription: course.shortDescription || '',
          category: course.category || '',
          level: course.level || 'Beginner',
          duration: course.duration || '',
          price: course.price ?? '',
          description: course.description || '',
          thumbnail: course.thumbnail || '',
          isShort: Boolean(course.isShort),
          isPublished: Boolean(course.isPublished),
        });
        const courseLessons = course.lessons?.length
          ? course.lessons
          : (course.syllabus || []).map((title) => ({ title }));
        setLessons(courseLessons.map(lessonFormValue));
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [id]);

  const updateCourse = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const uploadThumbnail = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Choose a PNG, JPG, or WEBP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be 5MB or smaller.');
      return;
    }

    setError('');
    setThumbnailPreview(URL.createObjectURL(file));
    setThumbnailUploading(true);
    try {
      const { thumbnail } = await courseApi.uploadThumbnail(file);
      updateCourse('thumbnail', thumbnail);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setThumbnailUploading(false);
    }
  };

  const updateLesson = (lessonIndex, key, value) => setLessons((current) => current.map((lesson, index) =>
    index === lessonIndex ? { ...lesson, [key]: value } : lesson
  ));

  const moveLesson = (lessonIndex, offset) => setLessons((current) => {
    const targetIndex = lessonIndex + offset;
    if (targetIndex < 0 || targetIndex >= current.length) return current;
    const reordered = [...current];
    [reordered[lessonIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[lessonIndex]];
    return reordered;
  });

  const submit = async (event) => {
    event.preventDefault();
    const shouldPublish = event.nativeEvent.submitter?.value === 'publish';
    if (thumbnailUploading || thumbnailPreview) {
      setError(thumbnailUploading ? 'Please wait for the thumbnail upload to finish.' : 'Thumbnail upload failed. Choose the image again before saving.');
      return;
    }
    setLoading(true);
    setSavingAction(shouldPublish ? 'publish' : 'draft');
    setError('');
    const savedLessons = lessons.filter((lesson) => lesson.title.trim()).map(lessonPayload);
    const payload = {
      ...form,
      price: Number(form.price),
      isPublished: shouldPublish,
      lessons: savedLessons,
      syllabus: savedLessons.map((lesson) => lesson.title),
    };

    try {
      if (id) await courseApi.update(id, payload);
      else await courseApi.create(payload);
      navigate('/teacher/my-courses');
    } catch (requestError) {
      setError(requestError.message);
      setLoading(false);
      setSavingAction('');
    }
  };

  return (
    <div className="course-editor">
      <header className="course-editor-heading">
        <button type="button" className="btn-ghost course-back-link" onClick={() => navigate('/teacher/my-courses')}><FiArrowLeft size={16} /> Back to My Courses</button>
        <h1>{id ? 'Edit Course' : 'Create New Course'}</h1>
        <p className="page-sub">Create your course now. You can add modules, lessons and videos along the way.</p>
      </header>
      {error && <p role="alert" className="course-editor-error">{error}</p>}
      <form className="course-editor-form" onSubmit={submit}>
        <section className="course-form-section">
          <div className="course-section-heading">
            <div><h2>Course Type</h2><p>Choose how this course will be delivered.</p></div>
          </div>
          <div className="course-type-grid">
            <label className={`course-type-option${form.isShort ? ' selected' : ''}`}>
              <input type="radio" name="courseType" checked={form.isShort} onChange={() => updateCourse('isShort', true)} />
              <span className="course-type-icon"><FiBookOpen size={19} /></span>
              <span className="course-type-copy"><strong>Short Course</strong><span>Self-paced and compact learning designed for quick progress.</span></span>
              {form.isShort && <FiCheckCircle className="course-type-check" size={17} />}
            </label>
            <label className={`course-type-option${!form.isShort ? ' selected' : ''}`}>
              <input type="radio" name="courseType" checked={!form.isShort} onChange={() => updateCourse('isShort', false)} />
              <span className="course-type-icon"><FiVideo size={19} /></span>
              <span className="course-type-copy"><strong>Long / Live Course</strong><span>Structured learning for an in-depth course experience.</span></span>
              {!form.isShort && <FiCheckCircle className="course-type-check" size={17} />}
            </label>
          </div>
        </section>

        <section className="course-form-section">
          <div className="course-section-heading">
            <div><h2>Course Information</h2><p>Basic information students will see about your course.</p></div>
          </div>
          <div className="course-fields">
            <label className="course-field">Course Title <span>*</span><input className="form-input" value={form.title} onChange={(event) => updateCourse('title', event.target.value)} placeholder="e.g. Complete Digital Marketing Course" required /></label>
            <label className="course-field">Short Description <span>*</span><textarea className="form-input" rows={2} value={form.shortDescription} onChange={(event) => updateCourse('shortDescription', event.target.value)} placeholder="A short summary of what students will learn." required /></label>
            <label className="course-field">Full Description <span>*</span><textarea className="form-input" rows={5} value={form.description} onChange={(event) => updateCourse('description', event.target.value)} placeholder="Explain the course, outcomes, curriculum and what students can expect." required /></label>
            <div className="form-grid">
              <label className="course-field">Category <span>*</span><input className="form-input" value={form.category} onChange={(event) => updateCourse('category', event.target.value)} placeholder="e.g. Design, Business, Technology" required /></label>
              <label className="course-field">Level<select className="form-input" value={form.level} onChange={(event) => updateCourse('level', event.target.value)}>{['Beginner', 'Intermediate', 'Advanced'].map((level) => <option key={level}>{level}</option>)}</select></label>
            </div>
            <label className="course-field">Duration <span>*</span><input className="form-input" value={form.duration} onChange={(event) => updateCourse('duration', event.target.value)} placeholder="e.g. 8 weeks / 40 hours" required /></label>
          </div>
        </section>

        <section className="course-form-section">
          <div className="course-section-heading">
            <div><h2>Pricing</h2><p>Set the price students will pay for this course.</p></div>
            <span className="course-section-mark"><FiDollarSign size={17} /></span>
          </div>
          <label className="course-field">Course Price (INR) <span>*</span><div className="course-price-input"><span>₹</span><input className="form-input" type="number" min="0" value={form.price} onChange={(event) => updateCourse('price', event.target.value)} placeholder="0" required /></div></label>
        </section>

        <section className="course-form-section course-thumbnail-section">
          <section className="course-thumbnail-field" aria-labelledby="course-thumbnail-title">
            <div>
              <h2 id="course-thumbnail-title">Course Thumbnail</h2>
              <p className="page-sub">Upload the image that will represent this course. Maximum 5MB.</p>
            </div>
            <div className="course-thumbnail-dropzone">
              {thumbnailPreview || form.thumbnail ? (
                <div className="course-thumbnail-preview">
                  <img src={thumbnailPreview || form.thumbnail} alt="Course thumbnail preview" />
                  <div className="course-thumbnail-actions">
                    <p className="page-sub">{thumbnailUploading ? 'Uploading image…' : 'Course thumbnail'}</p>
                    <label className="btn-primary course-thumbnail-picker">
                      <FiUpload size={16} /> Choose Another
                      <input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadThumbnail} />
                    </label>
                    <button type="button" className="btn-outline" disabled={thumbnailUploading} onClick={() => { updateCourse('thumbnail', ''); setThumbnailPreview(''); }}>Remove image</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="course-thumbnail-icon"><FiImage size={24} /></div>
                  <strong>{thumbnailUploading ? 'Uploading image…' : 'Upload course thumbnail'}</strong>
                  <span>PNG, JPG, WEBP up to 5MB</span>
                  <label className="btn-primary course-thumbnail-picker">
                    <FiUpload size={16} /> Choose Image
                    <input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadThumbnail} />
                  </label>
                </>
              )}
            </div>
          </section>
        </section>

        <section className="course-form-section course-lessons-section">
          <div className="course-section-heading course-lessons-heading">
            <div><h2>Course Lessons</h2><p>Add video lessons, descriptions and learning resources.</p></div>
            <button type="button" className="btn-outline" onClick={() => setLessons((current) => [...current, blankLesson()])}><FiPlus size={16} /> Add lesson</button>
          </div>
          {lessons.length === 0 ? <div className="course-lessons-empty">No lessons added yet. You can add lessons now or edit the course later.</div> : (
            <div className="course-lesson-list">
              {lessons.map((lesson, index) => (
                <section key={lesson.id || `lesson-${index}`} className="course-lesson-item">
                  <div className="course-lesson-title">
                    <h3>Lesson {index + 1}</h3>
                    <div className="course-lesson-controls">
                      <button type="button" className="icon-btn" aria-label={`Move lesson ${index + 1} up`} title="Move up" disabled={index === 0} onClick={() => moveLesson(index, -1)}><FiArrowUp size={15} /></button>
                      <button type="button" className="icon-btn" aria-label={`Move lesson ${index + 1} down`} title="Move down" disabled={index === lessons.length - 1} onClick={() => moveLesson(index, 1)}><FiArrowDown size={15} /></button>
                      <button type="button" className="icon-btn" aria-label={`Remove lesson ${index + 1}`} title="Remove lesson" onClick={() => setLessons((current) => current.filter((_, lessonIndex) => lessonIndex !== index))}><FiTrash2 size={15} /></button>
                    </div>
                  </div>
                  <div className="course-fields">
                    <label className="course-field">Lesson Title <span>*</span><input className="form-input" value={lesson.title} onChange={(event) => updateLesson(index, 'title', event.target.value)} required /></label>
                    <label className="course-field">Video URL<input className="form-input" type="url" value={lesson.videoUrl} onChange={(event) => updateLesson(index, 'videoUrl', event.target.value)} placeholder="YouTube, Vimeo, or direct video URL" /></label>
                    <label className="course-field">Description<textarea className="form-input" rows={3} value={lesson.description} onChange={(event) => updateLesson(index, 'description', event.target.value)} /></label>
                    <label className="course-field">Resources, one per line<textarea className="form-input" rows={3} value={lesson.resourcesText} onChange={(event) => updateLesson(index, 'resourcesText', event.target.value)} placeholder="Workbook | https://example.com/workbook.pdf" /><small>Use “Title | URL” or paste a URL.</small></label>
                  </div>
                </section>
              ))}
            </div>
          )}
        </section>

        <div className="course-editor-actions">
          <span><FiCheckCircle size={16} /> Save as a draft or publish when ready.</span>
          <div className="course-editor-submit-actions">
            <button className="btn-outline" type="button" onClick={() => navigate('/teacher/my-courses')}>Cancel</button>
            <button disabled={loading || thumbnailUploading || Boolean(thumbnailPreview)} className="btn-outline" type="submit" value="draft"><FiSave size={16} /> {savingAction === 'draft' ? 'Saving…' : 'Save as Draft'}</button>
            <button disabled={loading || thumbnailUploading || Boolean(thumbnailPreview)} className="btn-primary" type="submit" value="publish"><FiCheckCircle size={16} /> {savingAction === 'publish' ? 'Publishing…' : 'Publish Course'}</button>
          </div>
        </div>
      </form>
    </div>
  );
}