// LawPenal.jsx
import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  BookOpen, 
  Search, 
  Filter, 
  FileText, 
  Gavel,
  Users,
  Building,
  Heart,
  Car,
  Eye,
  CreditCard,
  ChevronRight,
  Download,
  Star,
  Clock,
  Tag,
  Grid,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';
import ActDetails from './ActDetails';

// Import JSON files
import cpcData from './LawPenalJsons/cpc.json';
import crpcData from './LawPenalJsons/crpc.json';
import hmaData from './LawPenalJsons/hma.json';
import idaData from './LawPenalJsons/ida.json';
import ieaData from './LawPenalJsons/iea.json';
import ipcData from './LawPenalJsons/ipc.json';
import mvaData from './LawPenalJsons/MVA.json';
import niaData from './LawPenalJsons/nia.json';

const LawPenal = () => {
  const [selectedAct, setSelectedAct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(false);

  // Define legalActs with proper structure
  const [legalActs, setLegalActs] = useState([]);

  useEffect(() => {
    const actsConfig = [
      {
        key: 'ipc',
        shortName: 'IPC',
        title: 'Indian Penal Code, 1860',
        year: 1860,
        description: 'The primary criminal code of India, defining offences and punishments.',
        category: 'Criminal',
        actNumber: 'Act No. 45 of 1860',
        data: ipcData,
        icon: Gavel,
        color: 'bg-red-600',
        lightColor: 'bg-red-100',
        textColor: 'text-red-600',
        borderColor: 'border-red-500'
      },
      {
        key: 'crpc',
        shortName: 'CrPC',
        title: 'Code of Criminal Procedure, 1973',
        year: 1973,
        description: 'Governs the procedure for criminal justice administration in India.',
        category: 'Criminal Procedure',
        actNumber: 'Act No. 2 of 1974',
        data: crpcData,
        icon: Scale,
        color: 'bg-blue-600',
        lightColor: 'bg-blue-100',
        textColor: 'text-blue-600',
        borderColor: 'border-blue-500'
      },
      {
        key: 'cpc',
        shortName: 'CPC',
        title: 'Code of Civil Procedure, 1908',
        year: 1908,
        description: 'Regulates the administration of civil proceedings in India.',
        category: 'Civil Procedure',
        actNumber: 'Act No. 5 of 1908',
        data: cpcData,
        icon: BookOpen,
        color: 'bg-green-600',
        lightColor: 'bg-green-100',
        textColor: 'text-green-600',
        borderColor: 'border-green-500'
      },
      {
        key: 'iea',
        shortName: 'IEA',
        title: 'Indian Evidence Act, 1872',
        year: 1872,
        description: 'Defines the rules for admissibility of evidence in Indian courts.',
        category: 'Evidence',
        actNumber: 'Act No. 1 of 1872',
        data: ieaData,
        icon: FileText,
        color: 'bg-purple-600',
        lightColor: 'bg-purple-100',
        textColor: 'text-purple-600',
        borderColor: 'border-purple-500'
      },
      {
        key: 'hma',
        shortName: 'HMA',
        title: 'Hindu Marriage Act, 1955',
        year: 1955,
        description: 'Governs marriage, divorce, and related matters for Hindus.',
        category: 'Family Law',
        actNumber: 'Act No. 25 of 1955',
        data: hmaData,
        icon: Heart,
        color: 'bg-pink-600',
        lightColor: 'bg-pink-100',
        textColor: 'text-pink-600',
        borderColor: 'border-pink-500'
      },
      {
        key: 'ida',
        shortName: 'IDA',
        title: 'Indian Divorce Act, 1869',
        year: 1869,
        description: 'Provides for dissolution of marriages for Christians.',
        category: 'Family Law',
        actNumber: 'Act No. 4 of 1869',
        data: idaData,
        icon: Users,
        color: 'bg-indigo-600',
        lightColor: 'bg-indigo-100',
        textColor: 'text-indigo-600',
        borderColor: 'border-indigo-500'
      },
      {
        key: 'mva',
        shortName: 'MVA',
        title: 'Motor Vehicles Act, 1988',
        year: 1988,
        description: 'Regulates traffic, vehicle registration, and road safety.',
        category: 'Traffic Law',
        actNumber: 'Act No. 59 of 1988',
        data: mvaData,
        icon: Car,
        color: 'bg-yellow-600',
        lightColor: 'bg-yellow-100',
        textColor: 'text-yellow-600',
        borderColor: 'border-yellow-500'
      },
      {
        key: 'nia',
        shortName: 'NIA',
        title: 'Negotiable Instruments Act, 1881',
        year: 1881,
        description: 'Deals with promissory notes, bills of exchange, and cheques.',
        category: 'Commercial Law',
        actNumber: 'Act No. 26 of 1881',
        data: niaData,
        icon: CreditCard,
        color: 'bg-teal-600',
        lightColor: 'bg-teal-100',
        textColor: 'text-teal-600',
        borderColor: 'border-teal-500'
      }
    ];

    const actsWithCounts = actsConfig.map(act => ({
      ...act,
      sections: getSectionsCount(act.data),
      chapters: getChaptersCount(act.data),
      extractedSections: extractSections(act.data)
    }));

    setLegalActs(actsWithCounts);
  }, []);

  // Define categories
  const categories = ['all', 'Criminal', 'Criminal Procedure', 'Civil Procedure', 'Evidence', 'Family Law', 'Traffic Law', 'Commercial Law'];

  // Helper function to get sections count
  const getSectionsCount = (data) => {
    if (!data) return 0;
    if (Array.isArray(data)) return data.filter(item => item.section_desc || item.description || item.text).length;
    if (Array.isArray(data.sections)) return data.sections.length;
    if (Array.isArray(data.acts)) return data.acts.length;
    if (Array.isArray(data.chapters)) {
      return data.chapters.reduce((total, chapter) => {
        return total + (Array.isArray(chapter.sections) ? chapter.sections.length : 0);
      }, 0);
    }
    
    if (typeof data === 'object' && data !== null) {
      const keys = Object.keys(data);
      for (const key of keys) {
        if (Array.isArray(data[key]) && (key.toLowerCase().includes('section') || key.toLowerCase().includes('act'))) {
          return data[key].filter(item => item.section_desc || item.description || item.text).length;
        }
      }
    }
    
    return 0;
  };

  // Helper function to get chapters count
  const getChaptersCount = (data) => {
    if (!data) return 0;
    if (Array.isArray(data) && data[0] && data[0].chapter) {
      const uniqueChapters = new Set(data.map(item => item.chapter || 0));
      return uniqueChapters.size;
    }
    if (Array.isArray(data.chapters)) return data.chapters.length;
    if (Array.isArray(data.parts)) return data.parts.length;
    if (data.structure && Array.isArray(data.structure.chapters)) return data.structure.chapters.length;
    return 0;
  };

  // Helper function to extract sections from data
  const extractSections = (data) => {
    if (!data) return [];
    
    if (Array.isArray(data)) {
      return data
        .map((item, index) => {
          if (!item.section_desc && !item.description && !item.text) return null;
          const chapterMatch = item['chapter,section,section_title,section_desc']?.match(/^\d+,/);
          const chapter = chapterMatch ? chapterMatch[0].replace(',', '') : null;
          const sectionMatch = item['chapter,section,section_title,section_desc']?.match(/,(\d+),/);
          const sectionNum = sectionMatch ? sectionMatch[1] : index + 1;
          const titleMatch = item['chapter,section,section_title,section_desc']?.match(/,\d+,(.*?),"/);
          const title = titleMatch ? titleMatch[1] : `Section ${sectionNum}`;
          return {
            id: index + 1,
            number: sectionNum,
            section: sectionNum,
            title: title,
            content: item.section_desc || item.description || item.text || 'No content available',
            description: item.section_desc || item.description || item.text || 'No content available',
            chapter: chapter ? `Chapter ${chapter}` : null,
            chapterNumber: chapter || null
          };
        })
        .filter(Boolean);
    }
    
    if (Array.isArray(data.sections)) return data.sections.map((s, i) => ({ ...s, id: i + 1 }));
    if (Array.isArray(data.acts)) return data.acts.map((s, i) => ({ ...s, id: i + 1 }));
    
    if (Array.isArray(data.chapters)) {
      const allSections = [];
      data.chapters.forEach((chapter, chapterIndex) => {
        if (Array.isArray(chapter.sections)) {
          chapter.sections.forEach((section, secIndex) => {
            allSections.push({
              ...section,
              id: allSections.length + 1,
              chapter: chapter.title || chapter.name || `Chapter ${chapterIndex + 1}`,
              chapterNumber: chapter.number || chapterIndex + 1
            });
          });
        }
      });
      return allSections;
    }
    
    if (typeof data === 'object' && data !== null) {
      const keys = Object.keys(data);
      for (const key of keys) {
        if (Array.isArray(data[key]) && data[key].length > 0) {
          const firstItem = data[key][0];
          if (firstItem && (firstItem.section || firstItem.title || firstItem.description || firstItem.section_desc)) {
            return data[key].map((item, index) => ({
              ...item,
              id: index + 1,
              number: item.section || item.number || index + 1,
              section: item.section || item.number || index + 1,
              title: item.title || item.section_title || `Section ${index + 1}`,
              content: item.section_desc || item.description || item.text || 'No content available',
              description: item.section_desc || item.description || item.text || 'No content available'
            }));
          }
        }
      }
    }
    
    return [];
  };

  // Filter and sort legalActs
  const filteredActs = legalActs
    .filter(act => 
      (categoryFilter === 'all' || act.category === categoryFilter) &&
      (yearFilter === 'all' || act.year >= parseInt(yearFilter))
    )
    .filter(act => 
      act.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = sortBy === 'name' ? a.shortName : (sortBy === 'year' ? a.year : a.sections);
      const bVal = sortBy === 'name' ? b.shortName : (sortBy === 'year' ? b.year : b.sections);
      if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

  // If an act is selected, show its details instead of the main page
  if (selectedAct) {
    return <ActDetails act={selectedAct} onBack={() => setSelectedAct(null)} />;
  }

  if (loading || legalActs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Legal Acts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Scale className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Indian Legal Acts </h1>
                <p className="text-gray-600">Comprehensive access to key Indian statutes and codes</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Statistics Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6 text-center text-gray-900">Legal Acts Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {legalActs.reduce((sum, act) => sum + act.sections, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Sections</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">
                {legalActs.reduce((sum, act) => sum + act.chapters, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Chapters</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">{categories.length - 1}</div>
              <div className="text-sm text-gray-600">Law Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">
                {new Date().getFullYear() - Math.min(...legalActs.map(act => act.year))}+
              </div>
              <div className="text-sm text-gray-600">Years of Legal History</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Search and Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search acts by name, description, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">All Categories</option>
                {categories.slice(1).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">All Years</option>
                <option value="1800">1800s</option>
                <option value="1900">1900s</option>
                <option value="2000">2000s</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="name">Sort by Name</option>
                <option value="year">Sort by Year</option>
                <option value="sections">Sort by Sections</option>
              </select>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title={`Switch to ${viewMode === 'grid' ? 'List' : 'Grid'} view`}
                >
                  {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
          
          {/* Results Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-gray-600">
              Showing <span className="font-semibold">{filteredActs.length}</span> of <span className="font-semibold">{legalActs.length}</span> legal acts
              {searchTerm && <span> for "<span className="font-semibold">{searchTerm}</span>"</span>}
              {categoryFilter !== 'all' && <span> in <span className="font-semibold">{categoryFilter}</span></span>}
            </p>
          </div>
        </div>

        {/* Acts Grid/List */}
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
          {filteredActs.map((act) => (
            <div
              key={act.key}
              className={`bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group ${viewMode === 'list' ? 'flex' : ''}`}
              onClick={() => setSelectedAct(act)}
            >
              <div className={`border-l-4 ${act.borderColor} ${viewMode === 'list' ? 'flex items-center p-6 w-full' : 'p-6'} group-hover:bg-gray-50 transition-colors`}>
                {viewMode === 'grid' ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${act.lightColor} rounded-lg flex items-center justify-center border border-gray-200`}>
                        <act.icon className={`w-6 h-6 ${act.textColor}`} />
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-500 font-medium">{act.year}</span>
                        <div className="text-xs text-gray-400">{act.actNumber}</div>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{act.shortName}</h3>
                    <h4 className="text-sm font-medium text-gray-600 mb-3 line-clamp-2">{act.title}</h4>
                    <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">{act.description}</p>
                    
                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${act.lightColor} ${act.textColor}`}>
                        {act.category}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <FileText className="w-4 h-4 mr-1" />
                          {act.sections} Sections
                        </span>
                        {act.chapters > 0 && (
                          <span className="flex items-center">
                            <BookOpen className="w-4 h-4 mr-1" />
                            {act.chapters} Chapters
                          </span>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`w-16 h-16 ${act.lightColor} rounded-lg flex items-center justify-center mr-6 border border-gray-200 flex-shrink-0`}>
                      <act.icon className={`w-8 h-8 ${act.textColor}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{act.shortName}</h3>
                          <h4 className="text-base font-medium text-gray-700 mt-1">{act.title}</h4>
                        </div>
                        <div className="text-right ml-4 flex-shrink-0">
                          <span className="text-sm text-gray-500 font-medium">{act.year}</span>
                          <div className="text-xs text-gray-400">{act.actNumber}</div>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">{act.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${act.lightColor} ${act.textColor}`}>
                            {act.category}
                          </span>
                          <span className="text-sm text-gray-500 flex items-center">
                            <FileText className="w-4 h-4 mr-1" />
                            {act.sections} Sections
                          </span>
                          {act.chapters > 0 && (
                            <span className="text-sm text-gray-500 flex items-center">
                              <BookOpen className="w-4 h-4 mr-1" />
                              {act.chapters} Chapters
                            </span>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredActs.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Acts Found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search terms or filters to find what you're looking for.</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setYearFilter('all');
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LawPenal;