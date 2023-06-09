//FileUpload.tsx
// Note 2023-05-01 The namespacing made more sense when it was only a file being uploaded
// rather than a URL also being requested.
import React, { useEffect, useRef, useState } from 'react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  loading: boolean;
}

interface RedactFileUploadProps {
  fileName: string | null;
}

interface RedactURLfetchProps {
  onFileUpload: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, loading }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [fileName, setFileName] = useState<string | null>(null);
  const [activeComponent, setActiveComponent] = useState('file');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      alert('Please select a file handleChange');
      return;
    }

    const file = event.target.files[0];
    if (file) {
      onFileUpload(file);
      setFileName(file.name);
    }
  };

  function RedactFileUpload({ fileName }: RedactFileUploadProps) {
    return (
      <>

        <div className='border border-teal p-2  h-20'>
          <input
            className="hidden w-full border border-teal mt-2"
            type="file"
            ref={fileInputRef}
            onChange={handleChange}
            accept=".doc,.docx,.pdf,.json,.txt,.html"
            disabled={loading}
          />
          <button
            className="w-full border border-teal text-teal text-left px-2 text-sm py-1 mt-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            {fileName
              ? 'Change file | ' + fileName.slice(0, 20) + (fileName.length > 20 ? '...' : '')
              : 'Choose file'}
          </button>
          <small className="text-xs text-right">
            Allowed files: .html, .docx, .txt, .json, .pdf
          </small>
        </div>
      </>)
  }

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function RedactURLfetch({ onFileUpload }: RedactURLfetchProps) {
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [url, setUrl] = useState('');
    const [isValidUrl, setIsValidUrl] = useState(true);

    const urlPattern = /^https?:\/\/.+$/;

    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = event.target.value;

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        if (urlPattern.test(inputValue)) {
          setIsValidUrl(true);
        } else {
          setIsValidUrl(false);
        }
      }, 500); // debounce time in ms

      setUrl(inputValue);
    };

    // Clean up the debounce timeout on component unmount
    useEffect(() => {
      return () => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
      };
    }, []);

    const fetchAndParseURL = async (url: string) => {
      setLoading(true);
      setDisabled(true);

      try {
        const proxyURL = `/api/proxy?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyURL);
        const html = await response.text();

        const file = new File([html], 'url-content.html', { type: 'text/html' });
        onFileUpload(file);
        await delay(25000);
      } catch (error) {
        console.error('Error fetching and parsing URL:', error);
      }

      await delay(25000);
      setLoading(false)
      setDisabled(false);
    };

    const activeURLButton = "bg-teal border-teal text-darkBlue";
    const inactiveURLButton = "bg-accent-400 border-teal text-darkBlue";


    return (
      <div className="border border-teal p-2 h-20 flex items-center">
        <div className="flex flex-grow items-center">
          <input
            type="text"
            className={`flex-grow bg-darkBlue ${isValidUrl ? 'border-teal' : 'border-red'} border-2 text-teal`}
            placeholder="https://"
            value={url}
            onChange={handleUrlChange}
          />
          <button
            className={` text-darkBlue p-1 h-11 items-center justify-center ${loading && disabled ?
              inactiveURLButton :
              isValidUrl ?
                activeURLButton : inactiveURLButton
              }`}
            onClick={() => fetchAndParseURL(url)}
            disabled={loading && disabled && isValidUrl}
          >
            {loading && disabled ? inactiveURLIcon() : activeURLIcon()}
          </button>
        </div>
      </div>)
  }

  return (
    <div className="mb-3 border-b border-teal pb-3">
      <h3 className="text-lg tracking-wide">Select your data</h3>
      <div>
        <div className="flex space-x-2">
          <h4
            className={`p-2 w-fit ${activeComponent === 'file'
              ? 'bg-darkBlue border-l border-r border-t border-teal -mb-1'
              : ''
              } relative z-10 cursor-pointer`}
            onClick={() => setActiveComponent('file')}
          >
            File
          </h4>
          <h4
            className={`p-2 w-fit ${activeComponent === 'url'
              ? 'bg-darkBlue border-l border-r border-t border-teal -mb-1'
              : ''
              } cursor-pointer`}
            onClick={() => setActiveComponent('url')}
          >
            URL
          </h4>
        </div>
        {activeComponent === 'file' && <RedactFileUpload fileName={fileName} />}
        {activeComponent === 'url' && <RedactURLfetch onFileUpload={onFileUpload} />}
      </div>
    </div>
  );
};

export default FileUpload;


function activeURLIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
}

function inactiveURLIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
}