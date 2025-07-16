import React, { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';

interface CSVUploadBlockProps {
  data: {
    csvData: any[] | null;
    fileName: string;
    preview: string;
  };
  id: string;
}

export const CSVUploadBlock: React.FC<CSVUploadBlockProps> = ({ data, id }) => {
  const [csvData, setCsvData] = useState<any[] | null>(data.csvData);
  const [fileName, setFileName] = useState(data.fileName);
  const [preview, setPreview] = useState(data.preview);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split('\n').filter(row => row.trim());
      
      if (rows.length === 0) return;
      
      // Parse CSV
      const headers = rows[0].split(',').map(h => h.trim());
      const parsedData = rows.slice(1).map(row => {
        const values = row.split(',').map(v => v.trim());
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] || '';
        });
        return obj;
      });
      
      setCsvData(parsedData);
      
      // Create preview
      const previewText = `Loaded ${parsedData.length} rows with columns: ${headers.join(', ')}`;
      setPreview(previewText);
      
      // Save to parent
      const nodeElement = document.querySelector(`[data-id="${id}"]`);
      if (nodeElement) {
        nodeElement.setAttribute('data-csv', JSON.stringify(parsedData));
        nodeElement.setAttribute('data-filename', file.name);
        nodeElement.setAttribute('data-preview', previewText);
      }
    };
    
    reader.readAsText(file);
  }, [id]);

  const getOutputData = useCallback(() => {
    return csvData;
  }, [csvData]);

  // Make the output data available globally
  React.useEffect(() => {
    (window as any)[`getNodeOutput_${id}`] = getOutputData;
  }, [id, getOutputData]);

  return (
    <div className="function-block csv-upload-block">
      <div className="block-header">
        <h3>CSV Data Source</h3>
        <button 
          className="expand-button"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      
      <div className="block-content">
        <div className="file-upload-section">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            id={`csv-upload-${id}`}
            style={{ display: 'none' }}
          />
          <label htmlFor={`csv-upload-${id}`} className="upload-button">
            {fileName || 'Choose CSV File'}
          </label>
        </div>
        
        {preview && (
          <div className="csv-preview">
            <p>{preview}</p>
          </div>
        )}
        
        {isExpanded && csvData && csvData.length > 0 && (
          <div className="csv-data-preview">
            <h4>Data Preview (first 5 rows):</h4>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    {Object.keys(csvData[0]).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 5).map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value: any, i) => (
                        <td key={i}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {csvData.length > 5 && (
                <p className="more-rows">... and {csvData.length - 5} more rows</p>
              )}
            </div>
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Right} />
    </div>
  );
};