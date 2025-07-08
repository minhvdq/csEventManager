export default function ResumeUploader({resume, setResume, resumeTitle, setResumeTitle}){
    const [pdfFile, setPdfFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!pdfFile) {
        alert("Please upload a PDF file.");
        return;
        }

        const formData = new FormData();
        formData.append('resume', pdfFile); // no need to send a separate title

        try {
        const res = await axios.post('http://localhost:3001/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
            alert('Upload successful!');
        } catch (error) {
            console.error(error);
            alert('Upload failed.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
            />
            <button type="submit">Upload PDF</button>
        </form>
    );
}