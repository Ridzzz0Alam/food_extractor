"use client";

import { useState } from 'react';
import { Upload, FileText, Loader2, AlertCircle, CheckCircle2, Download, Info, RefreshCw, Table, Code, FileSpreadsheet } from 'lucide-react';

export default function FoodAllergenExtractor() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ExtractionResult | null>(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'json'

  const allergensList = [
    'Gluten', 'Egg', 'Crustaceans', 'Fish', 'Peanut', 
    'Soy', 'Milk', 'Tree nuts', 'Celery', 'Mustard'
  ];

  const nutritionFields = [
    'Energy', 'Fat', 'Carbohydrate', 'Sugar', 'Protein', 'Sodium'
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    const validTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif'
    ];
    
    if (selectedFile && validTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
      setError(null);
      setResults(null);
    } else {
      setError('Please select a valid PDF or image file (JPG, PNG, WEBP, HEIC)');
      setFile(null);
    }
  };

  const extractTextFromPDF = async (file: File) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const fileType = file.type;
        const isImage = fileType.startsWith('image/');
        
        // Simulate AI processing with realistic extraction
        // In production, this would analyze the actual file content
        setTimeout(() => {
          // Generate varied sample data based on file type
          const productNames = [
            'Chocolate Chip Cookies',
            'Organic Peanut Butter',
            'Almond Milk',
            'Gluten-Free Pasta',
            'Mixed Nuts Trail Mix',
            'Greek Yogurt',
            'Whole Wheat Bread',
            'Soy Sauce'
          ];
          
          const randomProduct = productNames[Math.floor(Math.random() * productNames.length)];
          
          // Generate random but realistic allergen profile
          const allergenProfiles = {
            'Chocolate Chip Cookies': { Gluten: true, Egg: true, Milk: true, Soy: true },
            'Organic Peanut Butter': { Peanut: true, 'Tree nuts': true },
            'Almond Milk': { 'Tree nuts': true },
            'Gluten-Free Pasta': { Egg: true },
            'Mixed Nuts Trail Mix': { Peanut: true, 'Tree nuts': true, Soy: true },
            'Greek Yogurt': { Milk: true },
            'Whole Wheat Bread': { Gluten: true, Milk: true, Soy: true },
            'Soy Sauce': { Gluten: true, Soy: true, Fish: true }
          };
          
          const baseAllergens = {
            'Gluten': false,
            'Egg': false,
            'Crustaceans': false,
            'Fish': false,
            'Peanut': false,
            'Soy': false,
            'Milk': false,
            'Tree nuts': false,
            'Celery': false,
            'Mustard': false
          };
          
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const allergens = { ...baseAllergens, ...((allergenProfiles as Record<string, any>)[randomProduct] || {}) };
          
          const sampleResults = {
            //productName: randomProduct,
            allergens: allergens,
            nutrition: {
              'Energy': `${Math.floor(Math.random() * 300 + 200)} kcal / 100g`,
              'Fat': `${(Math.random() * 30 + 5).toFixed(1)}g / 100g`,
              'Carbohydrate': `${(Math.random() * 60 + 10).toFixed(1)}g / 100g`,
              'Sugar': `${(Math.random() * 30 + 2).toFixed(1)}g / 100g`,
              'Protein': `${(Math.random() * 20 + 3).toFixed(1)}g / 100g`,
              'Sodium': `${(Math.random() * 1.5 + 0.1).toFixed(2)}g / 100g`
            },
            confidence: Math.random() > 0.3 ? 'high' : 'medium',
            extractedFrom: file.name,
            fileType: isImage ? 'Image (OCR)' : 'PDF Document'
          };
          resolve(sampleResults);
        }, 2500);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const extractedData = await extractTextFromPDF(file);
      setResults(extractedData);
    } catch (err) {
      console.error('Extraction error:', err);
      setError('Failed to process PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadJSON = () => {
    if (!results) return;
    
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `allergen-data-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSV = () => {
    if (!results) return;
    
    // Create CSV content with proper escaping
    let csv = 'Category,Item,Value\n';
    
    // Add product name
    if (results.productName) {
      csv += `Product,Name,${escapeCSV(results.productName)}\n`;
    }
    
    // Add blank line
    csv += '\n';
    
    // Add allergens header
    csv += 'ALLERGENS\n';
    Object.entries(results.allergens || {}).forEach(([allergen, present]) => {
      csv += `Allergen,${escapeCSV(allergen)},${present ? 'Present' : 'Not Present'}\n`;
    });
    
    // Add blank line
    csv += '\n';
    
    // Add nutrition header
    csv += 'NUTRITION\n';
    Object.entries(results.nutrition || {}).forEach(([nutrient, value]) => {
      csv += `Nutrition,${escapeCSV(nutrient)},${escapeCSV(value as string | number | null | undefined)}\n`;
    });
    
    // Add blank line
    csv += '\n';
    
    // Add metadata header
    csv += 'METADATA\n';
    if (results.confidence) {
      csv += `Metadata,Confidence,${escapeCSV(results.confidence)}\n`;
    }
    if (results.fileType) {
      csv += `Metadata,File Type,${escapeCSV(results.fileType)}\n`;
    }
    if (results.extractedFrom) {
      csv += `Metadata,Source File,${escapeCSV(results.extractedFrom)}\n`;
    }
    
    // Create and download with BOM for Excel compatibility
    const BOM = '\uFEFF';
    const dataBlob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `allergen-data-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const escapeCSV = (value: string | number | null | undefined): string => {
    if (value == null) return '';
    const str = String(value);
    // If value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const resetApp = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
            <div className="bg-indigo-100 p-3 rounded-xl">
              <FileText className="w-8 h-8 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Food Allergen & Nutrition Extractor
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">
                AI-powered extraction from PDF documents
              </p>
            </div>
          </div>

          {/* Demo Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Demo Mode - Supports PDFs & Images</p>
              <p>This demo simulates AI extraction with OCR capabilities. Upload food product labels as PDFs or images (JPG, PNG, WEBP). For production use with real OpenAI Vision API integration, deploy the backend API.</p>
            </div>
          </div>
          
          {/* Upload Section */}
          <div className="border-2 border-dashed border-indigo-300 rounded-xl p-6 sm:p-8 text-center bg-gradient-to-br from-indigo-50 to-purple-50 mb-6 hover:border-indigo-400 transition-colors">
            <Upload className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="text-indigo-600 font-semibold hover:text-indigo-700 text-base sm:text-lg">
                Choose PDF or Image file
              </span>
              <span className="text-gray-500 text-sm sm:text-base"> or drag and drop</span>
            </label>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">PDF, JPG, PNG, WEBP up to 10MB</p>
            
            {file && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
                <FileText className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{file.name}</span>
                <span className="text-xs text-gray-500">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm sm:text-base">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="hidden sm:inline">Processing PDF with AI...</span>
                  <span className="sm:hidden">Processing...</span>
                </>
              ) : (
                'Extract Data'
              )}
            </button>
            {(file || results || error) && !loading && (
              <button
                onClick={resetApp}
                className="px-4 sm:px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors shadow-md flex items-center gap-2"
                title="Refresh page and start over"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                Extraction Results
              </h2>
              <div className="flex gap-2 flex-wrap">
                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'table'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Table className="w-4 h-4" />
                    <span className="hidden sm:inline">Table</span>
                  </button>
                  <button
                    onClick={() => setViewMode('json')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'json'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Code className="w-4 h-4" />
                    <span className="hidden sm:inline">JSON</span>
                  </button>
                </div>
                {/* Smart Download Button - Changes Based on View Mode */}
                {viewMode === 'table' ? (
                  <button
                    onClick={downloadCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md text-sm font-semibold"
                    title="Download as CSV spreadsheet"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span className="hidden md:inline">Download CSV</span>
                    <span className="md:hidden">CSV</span>
                  </button>
                ) : (
                  <button
                    onClick={downloadJSON}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md text-sm font-semibold"
                    title="Download as JSON"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden md:inline">Download JSON</span>
                    <span className="md:hidden">JSON</span>
                  </button>
                )}
              </div>
            </div>

            {viewMode === 'table' ? (
              <>
                {/* Allergens */}
                <div className="mb-8">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    Allergens Detected
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {allergensList.map((allergen) => {
                      const present = results.allergens?.[allergen];
                      return (
                        <div
                          key={allergen}
                          className={`p-3 rounded-lg border-2 flex items-center gap-2 transition-all hover:scale-105 ${
                            present
                              ? 'bg-red-50 border-red-300 shadow-sm'
                              : 'bg-green-50 border-green-300 shadow-sm'
                          }`}
                        >
                          {present ? (
                            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                          )}
                          <span
                            className={`text-xs sm:text-sm font-medium ${
                              present ? 'text-red-700' : 'text-green-700'
                            }`}
                          >
                            {allergen}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-600">
                      <span className="font-semibold">Present:</span>{' '}
                      {allergensList.filter(a => results.allergens?.[a]).join(', ') || 'None'}
                    </p>
                  </div>
                </div>

                {/* Nutritional Values */}
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    Nutritional Values
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {nutritionFields.map((field) => (
                      <div
                        key={field}
                        className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <p className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">{field}</p>
                        <p className="text-base sm:text-lg font-bold text-gray-800">
                          {results.nutrition?.[field] || 'Not detected'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metadata */}
                <div className="mt-6 grid sm:grid-cols-3 gap-4">
                  {results.confidence && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs sm:text-sm text-gray-600">
                        Detection Accuracy
                      </p>
                      <p className="text-base sm:text-lg font-semibold text-gray-800 capitalize mt-1">
                        {results.confidence}
                      </p>
                    </div>
                  )}
                  {results.fileType && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs sm:text-sm text-gray-600">
                        Document Type
                      </p>
                      <p className="text-base sm:text-lg font-semibold text-gray-800 mt-1">
                        {results.fileType}
                      </p>
                    </div>
                  )}
                  {results.extractedFrom && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs sm:text-sm text-gray-600">
                        Document Name
                      </p>
                      <p className="text-base sm:text-lg font-semibold text-gray-800 mt-1 truncate">
                        {results.extractedFrom}
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-gray-900 rounded-xl p-6 overflow-auto">
                <pre className="text-green-400 text-xs sm:text-sm font-mono whitespace-pre-wrap break-words">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {!results && !loading && (
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
              How It Works
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Upload File</h4>
                  <p className="text-sm text-gray-600">Select a PDF or image (JPG, PNG, WEBP) containing food product information, nutrition labels, or ingredient lists</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">AI Processing with OCR</h4>
                  <p className="text-sm text-gray-600">Advanced AI with optical character recognition analyzes the document/image and extracts structured data</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">View & Export</h4>
                  <p className="text-sm text-gray-600">Review extracted data and download as JSON for further use</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}