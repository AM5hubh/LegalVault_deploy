import React, { useState } from "react";
import {
  ArrowLeft,
  Search,
  Download,
  FileText,
  Star,
  Copy,
  Share2,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Hash,
  Clock,
  Tag,
  Eye,
  BookOpen,
  Settings,
  Scale,
  CheckCircle,
} from "lucide-react";

const ActDetails = ({ act, onBack }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("all");
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [bookmarkedSections, setBookmarkedSections] = useState(new Set());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [sortBy, setSortBy] = useState("section");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sectionRange, setSectionRange] = useState({ min: "", max: "" });
  const [contentLength, setContentLength] = useState("all");
  const [searchFields, setSearchFields] = useState({
    title: true,
    content: true,
    section: true,
  });

  // Get sections and chapters from the act data
  const sections = act.extractedSections || [];
  const chapters = act.data?.chapters || [];

  // Advanced filtering logic
  const filteredSections = sections
    .filter((section) => {
      // Search filter
      if (searchTerm) {
        const searchContent = [];
        if (searchFields.title && section.title)
          searchContent.push(section.title);
        if (
          searchFields.content &&
          (section.content || section.description || section.section_desc)
        ) {
          searchContent.push(
            section.content || section.description || section.section_desc,
          );
        }
        if (searchFields.section && section.section)
          searchContent.push(section.section.toString());

        const matchesSearch = searchContent
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;
      }

      // Chapter filter
      const matchesChapter =
        selectedChapter === "all" ||
        section.chapter === selectedChapter ||
        section.chapterNumber === selectedChapter ||
        section.chapterId === selectedChapter;

      if (!matchesChapter) return false;

      // Section range filter
      if (sectionRange.min || sectionRange.max) {
        const sectionNum = parseInt(section.section || section.number || 0);
        if (sectionRange.min && sectionNum < parseInt(sectionRange.min))
          return false;
        if (sectionRange.max && sectionNum > parseInt(sectionRange.max))
          return false;
      }

      // Content length filter
      if (contentLength !== "all") {
        const content =
          section.content || section.description || section.section_desc || "";
        const length = content.length;

        switch (contentLength) {
          case "short":
            if (length > 500) return false;
            break;
          case "medium":
            if (length <= 500 || length > 1500) return false;
            break;
          case "long":
            if (length <= 1500) return false;
            break;
        }
      }

      return true;
    })
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "section":
          aValue = parseInt(a.section || a.number || 0);
          bValue = parseInt(b.section || b.number || 0);
          break;
        case "title":
          aValue = (a.title || "").toLowerCase();
          bValue = (b.title || "").toLowerCase();
          break;
        case "content":
          aValue = (a.content || a.description || a.section_desc || "").length;
          bValue = (b.content || b.description || b.section_desc || "").length;
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const toggleSectionExpansion = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const toggleBookmark = (sectionId) => {
    const newBookmarks = new Set(bookmarkedSections);
    if (newBookmarks.has(sectionId)) {
      newBookmarks.delete(sectionId);
    } else {
      newBookmarks.add(sectionId);
    }
    setBookmarkedSections(newBookmarks);
  };

  const copySection = (section) => {
    const sectionNumber =
      section.section || section.number || section.id || "Unknown";
    const sectionTitle = section.title || `Section ${sectionNumber}`;
    const sectionContent =
      section.content ||
      section.description ||
      section.section_desc ||
      "No content available";

    const text = `${act.shortName} Section ${sectionNumber}: ${sectionTitle}\n\n${sectionContent}`;
    navigator.clipboard.writeText(text).then(() => {
      alert("Section copied to clipboard!");
    });
  };

  const downloadAct = () => {
    const content = sections
      .map((section, index) => {
        const sectionNumber =
          section.section || section.number || section.id || index + 1;
        const sectionTitle = section.title || `Section ${sectionNumber}`;
        const sectionContent =
          section.content ||
          section.description ||
          section.section_desc ||
          "No content available";

        return `Section ${sectionNumber}: ${sectionTitle}\n${sectionContent}\n\n`;
      })
      .join("");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${act.shortName}-${act.year}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedChapter("all");
    setSectionRange({ min: "", max: "" });
    setContentLength("all");
    setSearchFields({ title: true, content: true, section: true });
  };

  const expandAllSections = () => {
    setExpandedSections(
      new Set(
        filteredSections.map(
          (section, index) =>
            section.id || section.section || section.number || index,
        ),
      ),
    );
  };

  const collapseAllSections = () => {
    setExpandedSections(new Set());
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section - Consistent with AboutUs page */}
      <section className="bg-linear-to-r from-orange-600 via-white to-green-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-8">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-colors bg-white bg-opacity-90 px-4 py-2 rounded-lg shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Legal Acts</span>
            </button>
          </div>

          {/* Main Header Content */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Scale className="w-16 h-16 text-orange-600 mr-4" />
              <act.icon className="w-12 h-12 text-gray-700" />
            </div>

            <h1 className="text-5xl font-bold text-gray-900 mb-2">
              {act.shortName}
            </h1>
            <h2 className="text-2xl font-medium text-gray-700 mb-6">
              {act.title}
            </h2>

            <p className="text-xl text-gray-700 max-w-4xl mx-auto mb-8 leading-relaxed">
              {act.description}
            </p>

            {/* Act Details */}
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 mb-8">
              <span className="flex items-center bg-white bg-opacity-90 px-4 py-2 rounded-full shadow-sm">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                {act.actNumber}
              </span>
              <span className="flex items-center bg-white bg-opacity-90 px-4 py-2 rounded-full shadow-sm">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                Enacted in {act.year}
              </span>
              <span className="flex items-center bg-white bg-opacity-90 px-4 py-2 rounded-full shadow-sm">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                {act.category}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={downloadAct}
                className="inline-flex items-center bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors shadow-lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Act
              </button>
              {/* <button className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg">
                <Share2 className="w-5 h-5 mr-2" />
                Share Act
              </button> */}
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-orange-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {sections.length}
              </div>
              <div className="text-gray-600">Total Sections</div>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {act.chapters}
              </div>
              <div className="text-gray-600">Total Chapters</div>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {act.year}
              </div>
              <div className="text-gray-600">Year Enacted</div>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <Tag className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {bookmarkedSections.size}
              </div>
              <div className="text-gray-600">Bookmarked</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          {/* Basic Search */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search sections by keyword, content, or section number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center space-x-2 px-4 py-3 border rounded-lg transition-colors ${
                showAdvancedFilters
                  ? "bg-orange-50 border-orange-300 text-orange-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Advanced Filters</span>
              {showAdvancedFilters ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="border-t border-gray-200 pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Chapter Filter */}
                {chapters.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chapter
                    </label>
                    <select
                      value={selectedChapter}
                      onChange={(e) => setSelectedChapter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="all">All Chapters</option>
                      {chapters.map((ch, idx) => (
                        <option key={idx} value={ch.number || idx + 1}>
                          Chapter {ch.number || idx + 1}:{" "}
                          {ch.title || `Chapter ${idx + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Section Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section Range
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={sectionRange.min}
                      onChange={(e) =>
                        setSectionRange((prev) => ({
                          ...prev,
                          min: e.target.value,
                        }))
                      }
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={sectionRange.max}
                      onChange={(e) =>
                        setSectionRange((prev) => ({
                          ...prev,
                          max: e.target.value,
                        }))
                      }
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Content Length */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Length
                  </label>
                  <select
                    value={contentLength}
                    onChange={(e) => setContentLength(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="all">All Lengths</option>
                    <option value="short">Short (≤500 chars)</option>
                    <option value="medium">Medium (500-1500 chars)</option>
                    <option value="long">Long ({">"}1500 chars)</option>
                  </select>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <div className="flex space-x-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="section">Section Number</option>
                      <option value="title">Title</option>
                      <option value="content">Content Length</option>
                    </select>
                    <button
                      onClick={() =>
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
                    >
                      {sortOrder === "asc" ? (
                        <SortAsc className="w-4 h-4" />
                      ) : (
                        <SortDesc className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Search Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search In
                </label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={searchFields.title}
                      onChange={(e) =>
                        setSearchFields((prev) => ({
                          ...prev,
                          title: e.target.checked,
                        }))
                      }
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Section Titles
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={searchFields.content}
                      onChange={(e) =>
                        setSearchFields((prev) => ({
                          ...prev,
                          content: e.target.checked,
                        }))
                      }
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Section Content
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={searchFields.section}
                      onChange={(e) =>
                        setSearchFields((prev) => ({
                          ...prev,
                          section: e.target.checked,
                        }))
                      }
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Section Numbers
                    </span>
                  </label>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <button
                  onClick={clearAllFilters}
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Clear All Filters</span>
                </button>
                <div className="text-sm text-gray-600">
                  Showing {filteredSections.length} of {sections.length}{" "}
                  sections
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title={`Switch to ${viewMode === "list" ? "Grid" : "List"} view`}
            >
              {viewMode === "list" ? (
                <Grid className="w-4 h-4" />
              ) : (
                <List className="w-4 h-4" />
              )}
              <span className="text-sm">
                {viewMode === "list" ? "Grid" : "List"} View
              </span>
            </button>

            <button
              onClick={expandAllSections}
              className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
            >
              Expand All
            </button>

            <button
              onClick={collapseAllSections}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Collapse All
            </button>
          </div>

          <div className="text-sm text-gray-600">
            {searchTerm && (
              <span>
                Search results for "<strong>{searchTerm}</strong>" •{" "}
              </span>
            )}
            {filteredSections.length} sections found
          </div>
        </div>

        {/* Sections List */}
        {filteredSections.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-200">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No Sections Found
            </h3>
            <p className="text-gray-500 mb-6">
              {sections.length === 0
                ? "No sections are available for this act."
                : "Try adjusting your search criteria or filters to find what you're looking for."}
            </p>
            {(searchTerm ||
              selectedChapter !== "all" ||
              sectionRange.min ||
              sectionRange.max ||
              contentLength !== "all") && (
              <button
                onClick={clearAllFilters}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div
            className={`space-y-6 ${viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : ""}`}
          >
            {filteredSections.map((section, index) => {
              const sectionId =
                section.id || section.section || section.number || index;
              const sectionNumber =
                section.section || section.number || section.id || index + 1;
              const sectionTitle = section.title || `Section ${sectionNumber}`;
              const sectionContent =
                section.content ||
                section.description ||
                section.section_desc ||
                "No content available";

              return (
                <div
                  key={sectionId}
                  className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-200 ${
                    viewMode === "grid" ? "" : "mb-0"
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Hash className="w-5 h-5 text-orange-600" />
                          <span className="font-mono text-lg font-bold text-gray-900">
                            Section {sectionNumber}
                          </span>
                        </div>
                        {section.chapter && (
                          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                            {section.chapter}
                          </span>
                        )}
                        {bookmarkedSections.has(sectionId) && (
                          <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleBookmark(sectionId)}
                          className={`p-2 rounded-lg transition-colors ${
                            bookmarkedSections.has(sectionId)
                              ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                              : "bg-gray-100 text-gray-600 hover:bg-yellow-100 hover:text-yellow-600"
                          }`}
                          title="Bookmark Section"
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => copySection(section)}
                          className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-orange-100 hover:text-orange-600 transition-colors"
                          title="Copy Section"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => toggleSectionExpansion(sectionId)}
                          className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          {expandedSections.has(sectionId) ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                      {sectionTitle}
                    </h3>

                    {expandedSections.has(sectionId) ? (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                        <div className="prose prose-sm max-w-none">
                          <div className="text-gray-800 leading-relaxed whitespace-pre-line">
                            {sectionContent}
                          </div>
                        </div>

                        {section.subsections &&
                          Array.isArray(section.subsections) &&
                          section.subsections.length > 0 && (
                            <div className="mt-6">
                              <h4 className="font-bold text-gray-900 mb-3 text-lg">
                                Subsections
                              </h4>
                              <div className="space-y-3">
                                {section.subsections.map(
                                  (subsection, subIndex) => (
                                    <div
                                      key={subIndex}
                                      className="bg-white rounded-lg p-4 border border-gray-200"
                                    >
                                      <div className="font-semibold text-gray-900 mb-2">
                                        (
                                        {subsection.number ||
                                          subsection.id ||
                                          subIndex + 1}
                                        ){" "}
                                        {subsection.title ||
                                          subsection.heading ||
                                          `Subsection ${subIndex + 1}`}
                                      </div>
                                      <div className="text-gray-700 text-sm leading-relaxed">
                                        {subsection.content ||
                                          subsection.description ||
                                          subsection.text ||
                                          "No content available"}
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}

                        {(section.punishment || section.penalty) && (
                          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                            <h4 className="font-bold text-red-800 mb-2 flex items-center">
                              <Eye className="w-4 h-4 mr-2" />
                              Punishment
                            </h4>
                            <p className="text-red-700 text-sm leading-relaxed">
                              {section.punishment || section.penalty}
                            </p>
                          </div>
                        )}

                        {/* Section Metadata */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>
                              Content length: {sectionContent.length} characters
                            </span>
                            <span>
                              Last viewed: {new Date().toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-600 line-clamp-3 leading-relaxed mb-3">
                          {sectionContent.substring(0, 200)}...
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{sectionContent.length} characters</span>
                          <span>Click to expand</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bookmarked Sections */}
        {bookmarkedSections.size > 0 && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-yellow-800 mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 fill-current" />
              Bookmarked Sections ({bookmarkedSections.size})
            </h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(bookmarkedSections).map((sectionId) => {
                const section = filteredSections.find(
                  (s, index) =>
                    (s.id || s.section || s.number || index) === sectionId,
                );
                const sectionNumber =
                  section?.section ||
                  section?.number ||
                  section?.id ||
                  sectionId;
                return (
                  section && (
                    <button
                      key={sectionId}
                      onClick={() => toggleSectionExpansion(sectionId)}
                      className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg text-sm font-medium hover:bg-yellow-200 transition-colors flex items-center space-x-1"
                    >
                      <Hash className="w-3 h-3" />
                      <span>Section {sectionNumber}</span>
                    </button>
                  )
                );
              })}
            </div>
            <button
              onClick={() => setBookmarkedSections(new Set())}
              className="mt-4 text-sm text-yellow-700 hover:text-yellow-800 transition-colors"
            >
              Clear all bookmarks
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActDetails;
