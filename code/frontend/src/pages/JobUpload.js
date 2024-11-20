import React, { useState } from 'react';
import { api } from './api'; // 导入api.js

const JobUpload = () => {
  // 定义表单字段的状态
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobSnippet, setJobSnippet] = useState('');
  const [jobLink, setJobLink] = useState('');
  const [sponsored, setSponsored] = useState(false);
  const [salary, setSalary] = useState('');
  const [message, setMessage] = useState(''); // 用于显示消息

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 构造 job 数据
    const job = {
      jobTitle,
      companyName,
      jobSnippet,
      jobLink,
      sponsored,
      salary: parseInt(salary, 10),
    };

    try {
      // 调用 API 提交 job 数据
      const response = await api.submitJob(job);

      // 判断后端返回的结果，显示相应的提示信息
      if (response.data.success) {
        setMessage('Upload successful!');
      } else if (response.data.error === 'Company not found') {
        setMessage('Upload failed: Company does not exist.');
      } else {
        setMessage('Upload failed: Unknown error.');
      }
    } catch (error) {
      // 处理请求错误
      setMessage('Upload failed: Server error.');
      console.error('Upload error:', error);
    }
  };

  return (
    <div>
      <h1>Job Upload Page</h1>

      {/* 显示上传成功或失败的消息 */}
      {message && <div className="message">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="jobTitle">Job Title:</label>
          <input
            type="text"
            id="jobTitle"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="companyName">Company Name:</label>
          <input
            type="text"
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="jobSnippet">Job Snippet:</label>
          <textarea
            id="jobSnippet"
            value={jobSnippet}
            onChange={(e) => setJobSnippet(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="jobLink">Job Link:</label>
          <input
            type="text"
            id="jobLink"
            value={jobLink}
            onChange={(e) => setJobLink(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="sponsored">Sponsored:</label>
          <input
            type="checkbox"
            id="sponsored"
            checked={sponsored}
            onChange={(e) => setSponsored(e.target.checked)}
          />
        </div>

        <div>
          <label htmlFor="salary">Salary:</label>
          <input
            type="number"
            id="salary"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            required
          />
        </div>

        <button type="submit">UPLOAD</button>
      </form>
    </div>
  );
};

export default JobUpload;