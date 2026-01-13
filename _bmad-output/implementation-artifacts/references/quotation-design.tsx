import React, { useState, useEffect } from "react";
import {
  Plus,
  Library,
  X,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  MoreHorizontal,
  ArrowLeft,
  Folder,
  Layers,
  Hammer,
  PenTool,
  CornerDownRight,
  GripVertical,
  Printer,
  Eye,
  EyeOff,
  Filter,
  Check,
  Image as ImageIcon,
  Maximize2,
  Moon,
  Sun,
} from "lucide-react";

// --- STYLES INJECTION ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    :root {
      --radius: 0.65rem;
      
      /* Light Mode Colors */
      --background: oklch(1 0 0);
      --foreground: oklch(0.141 0.005 285.823);
      --card: oklch(1 0 0);
      --card-foreground: oklch(0.141 0.005 285.823);
      --popover: oklch(1 0 0);
      --popover-foreground: oklch(0.141 0.005 285.823);
      --primary: oklch(0.488 0.243 264.376);
      --primary-foreground: oklch(0.97 0.014 254.604);
      --secondary: oklch(0.967 0.001 286.375);
      --secondary-foreground: oklch(0.21 0.006 285.885);
      --muted: oklch(0.967 0.001 286.375);
      --muted-foreground: oklch(0.552 0.016 285.938);
      --accent: oklch(0.967 0.001 286.375);
      --accent-foreground: oklch(0.21 0.006 285.885);
      --destructive: oklch(0.577 0.245 27.325);
      --destructive-foreground: oklch(0.985 0 0);
      --border: oklch(0.92 0.004 286.32);
      --input: oklch(0.92 0.004 286.32);
      --ring: oklch(0.708 0 0);
    }

    .dark {
      /* Dark Mode Colors */
      --background: oklch(0.141 0.005 285.823);
      --foreground: oklch(0.985 0 0);
      --card: oklch(0.21 0.006 285.885);
      --card-foreground: oklch(0.985 0 0);
      --popover: oklch(0.21 0.006 285.885);
      --popover-foreground: oklch(0.985 0 0);
      --primary: oklch(0.488 0.243 264.376);
      --primary-foreground: oklch(0.97 0.014 254.604);
      --secondary: oklch(0.274 0.006 286.033);
      --secondary-foreground: oklch(0.985 0 0);
      --muted: oklch(0.274 0.006 286.033);
      --muted-foreground: oklch(0.705 0.015 286.067);
      --accent: oklch(0.274 0.006 286.033);
      --accent-foreground: oklch(0.985 0 0);
      --destructive: oklch(0.704 0.191 22.216);
      --destructive-foreground: oklch(0.985 0 0);
      --border: oklch(1 0 0 / 10%);
      --input: oklch(1 0 0 / 15%);
      --ring: oklch(0.556 0 0);
    }

    body {
      font-family: 'Inter', sans-serif;
      background-color: var(--background);
      color: var(--foreground);
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    /* Custom Utility Classes mapping to CSS Variables */
    .bg-theme-background { background-color: var(--background); }
    .bg-theme-card { background-color: var(--card); }
    .bg-theme-muted { background-color: var(--muted); }
    .bg-theme-primary { background-color: var(--primary); }
    .bg-theme-secondary { background-color: var(--secondary); }
    .bg-theme-accent { background-color: var(--accent); }
    
    .text-theme-foreground { color: var(--foreground); }
    .text-theme-muted-foreground { color: var(--muted-foreground); }
    .text-theme-primary-foreground { color: var(--primary-foreground); }
    .text-theme-secondary-foreground { color: var(--secondary-foreground); }
    .text-theme-accent-foreground { color: var(--accent-foreground); }
    
    .border-theme-border { border-color: var(--border); }
    .border-theme-input { border-color: var(--input); }
    
    .rounded-theme-lg { border-radius: var(--radius); }
    .rounded-theme-md { border-radius: calc(var(--radius) - 2px); }
    .rounded-theme-sm { border-radius: calc(var(--radius) - 4px); }

    /* Print Overrides */
    @media print {
      body { -webkit-print-color-adjust: exact; background-color: white !important; color: black !important; }
      .dark { --background: white; --foreground: black; --card: white; --border: #e5e5e5; --muted: #f5f5f5; --muted-foreground: #737373; }
      .no-print { display: none !important; }
      .print-full-width { width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; border: none !important; }
    }
  `}</style>
);

// --- DATA MODELS ---

const initialItemState = {
  id: null,
  section: "Design Services",
  name: "",
  description: "",
  image: null,
  length: "",
  width: "",
  quantity: 1,
  unit: "ls",
  rate: 0,
  subItems: [],
};

const SECTIONS_ORDER = [
  "Design Services",
  "Interior Works",
  "Construction Works",
];

const TAB_MAPPING = [
  { id: "All", label: "All" },
  { id: "Design Services", label: "Design" },
  { id: "Interior Works", label: "Interior" },
  { id: "Construction Works", label: "Construction" },
];

const DEFAULT_TERMS = `PAYMENT SCHEDULE:
1. Mobilization Advance: 40% of the total estimated fee is due upon signing.
2. Design Development: 30% due upon approval of concept layouts and 3D views.
3. Pre-Execution: 20% due prior to release of working drawings.
4. Completion: 10% due upon project handover.

TERMS & CONDITIONS:
- This quotation is valid for 30 days from the date of issue.
- Prices are subject to change based on final material selection and market rates.
- Statutory approvals, liaisoning charges, and government taxes are excluded unless specified.`;

// Nested Library Data
const LIBRARY_DATA = {
  "Design Services": {
    "Concept Design": [
      {
        name: "Initial Space Planning",
        description: "Development of 2D layout options and flow analysis.",
        unit: "sqft",
        rate: 45,
      },
      {
        name: "Mood Boarding",
        description:
          "Curation of material palette, textures, and lighting concepts.",
        unit: "ls",
        rate: 15000,
      },
      {
        name: "Site Measurement",
        description: "Detailed physical survey of the site condition.",
        unit: "sqft",
        rate: 10,
      },
    ],
    "3D Visualization": [
      {
        name: "3D Perspective Render",
        description: "High-fidelity photorealistic rendering of key areas.",
        unit: "view",
        rate: 5000,
      },
      {
        name: "3D Walkthrough",
        description: "60-second animated walkthrough of the proposed design.",
        unit: "sec",
        rate: 1200,
      },
    ],
    "Technical Drawings": [
      {
        name: "Electrical Layout",
        description:
          "Detailed looping, switchboard positioning, and lighting points.",
        unit: "sqft",
        rate: 25,
      },
      {
        name: "Joinery Details",
        description:
          "Detailed shop drawings for custom furniture and millwork.",
        unit: "sheet",
        rate: 3000,
      },
    ],
  },
  "Interior Works": {
    "Civil & Demolition": [
      {
        name: "Demolition",
        description:
          "Removal of existing partition walls, flooring, and debris disposal.",
        unit: "ls",
        rate: 25000,
      },
      {
        name: "Block Masonry",
        description: "4 inch solid block work with rich cement mortar.",
        unit: "sqft",
        rate: 140,
      },
    ],
    "Flooring & Tiling": [
      {
        name: "Vitrified Tiling",
        description:
          "Laying of 4x2 vitrified tiles with spacer joints and grouting.",
        unit: "sqft",
        rate: 120,
      },
      {
        name: "Italian Marble Installation",
        description: "Laying, polishing, and sealing of Italian marble.",
        unit: "sqft",
        rate: 350,
      },
    ],
    "Ceiling & Finishing": [
      {
        name: "False Ceiling (Gypsum)",
        description:
          "Saint-Gobain gypsum framing and boarding with channel supports.",
        unit: "sqft",
        rate: 110,
      },
      {
        name: "Premium Painting",
        description:
          "Asian Paints Royale - 2 coats putty + 1 coat primer + 2 coats paint.",
        unit: "sqft",
        rate: 45,
      },
    ],
    "MEP Services": [
      {
        name: "HVAC Ducting",
        description: "Galvanized iron ducting for central air conditioning.",
        unit: "rft",
        rate: 450,
      },
      {
        name: "Plumbing Points",
        description: "Hot & cold water lines using Astral CPVC pipes.",
        unit: "point",
        rate: 1200,
      },
    ],
  },
  "Construction Works": {
    Structure: [
      {
        name: "Earthwork Excavation",
        description: "Excavation for foundation up to 5ft depth.",
        unit: "cft",
        rate: 12,
      },
      {
        name: "PCC Bedding",
        description: "Plain cement concrete (1:4:8) for foundation base.",
        unit: "cft",
        rate: 140,
      },
      {
        name: "RCC Columns & Beams",
        description: "Reinforced cement concrete M25 grade with steel.",
        unit: "cft",
        rate: 450,
      },
    ],
    "External Finishes": [
      {
        name: "External Plastering",
        description:
          "Double coat sand faced plaster with waterproofing compound.",
        unit: "sqft",
        rate: 55,
      },
      {
        name: "Terrace Waterproofing",
        description: "Brick bat coba waterproofing with china mosaic finish.",
        unit: "sqft",
        rate: 180,
      },
    ],
  },
};

// --- HELPER FUNCTIONS ---

const addItemToTree = (items, parentId, newItem) => {
  return items.map((item) => {
    if (item.id === parentId) {
      return {
        ...item,
        subItems: [...(item.subItems || []), newItem],
      };
    }
    if (item.subItems && item.subItems.length > 0) {
      return {
        ...item,
        subItems: addItemToTree(item.subItems, parentId, newItem),
      };
    }
    return item;
  });
};

const updateItemInTree = (items, updatedItem) => {
  return items.map((item) => {
    if (item.id === updatedItem.id) {
      return { ...updatedItem, subItems: item.subItems };
    }
    if (item.subItems && item.subItems.length > 0) {
      return {
        ...item,
        subItems: updateItemInTree(item.subItems, updatedItem),
      };
    }
    return item;
  });
};

const deleteItemFromTree = (items, targetId) => {
  return items
    .filter((item) => item.id !== targetId)
    .map((item) => ({
      ...item,
      subItems: item.subItems
        ? deleteItemFromTree(item.subItems, targetId)
        : [],
    }));
};

const calculateItemTotal = (item) => {
  const selfTotal = item.quantity * item.rate;
  const subItemsTotal = item.subItems
    ? item.subItems.reduce((acc, sub) => acc + calculateItemTotal(sub), 0)
    : 0;
  return selfTotal + subItemsTotal;
};

// --- COMPONENTS ---

const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  icon: Icon,
}) => {
  const baseStyle =
    "flex items-center justify-center px-4 py-2 rounded-theme-md transition-all duration-200 font-medium text-sm tracking-wide";
  const variants = {
    primary:
      "bg-theme-primary text-theme-primary-foreground hover:opacity-90 shadow-sm",
    secondary:
      "bg-theme-secondary text-theme-secondary-foreground border border-theme-border hover:bg-theme-accent hover:text-theme-accent-foreground",
    ghost:
      "text-theme-muted-foreground hover:text-theme-foreground hover:bg-theme-accent rounded-theme-sm",
    danger:
      "text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={16} className="mr-2" />}
      {children}
    </button>
  );
};

// --- MAIN APP ---

export default function QuotationApp() {
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [terms, setTerms] = useState(DEFAULT_TERMS);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // Dark Mode State

  const [activeTab, setActiveTab] = useState("All");
  const [collapsedSections, setCollapsedSections] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  const [libraryView, setLibraryView] = useState("sections");
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [targetParentId, setTargetParentId] = useState(null);

  const [currentItem, setCurrentItem] = useState(initialItemState);
  const [isEditing, setIsEditing] = useState(false);
  const [parentIdForSubItem, setParentIdForSubItem] = useState(null);

  // --- DERIVED STATE ---

  const filteredItems =
    activeTab === "All"
      ? items
      : items.filter((item) => item.section === activeTab);

  const sectionsToRender = activeTab === "All" ? SECTIONS_ORDER : [activeTab];

  const subtotal = filteredItems.reduce(
    (acc, item) => acc + calculateItemTotal(item),
    0
  );
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  // --- ACTIONS ---

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSectionCollapse = (section) => {
    if (collapsedSections.includes(section)) {
      setCollapsedSections(collapsedSections.filter((s) => s !== section));
    } else {
      setCollapsedSections([...collapsedSections, section]);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const togglePreview = () => {
    setIsPreviewMode(!isPreviewMode);
    if (!isPreviewMode) {
      setIsLibraryOpen(false);
      setIsModalOpen(false);
    }
  };

  const handleAddNewClick = () => {
    const defaultSection = activeTab === "All" ? "Design Services" : activeTab;
    setCurrentItem({ ...initialItemState, section: defaultSection });
    setIsEditing(false);
    setParentIdForSubItem(null);
    setTargetParentId(null);
    setIsModalOpen(true);
    setIsLibraryOpen(false);
  };

  const handleAddSubItemClick = (parentId, section) => {
    setCurrentItem({ ...initialItemState, section: section });
    setParentIdForSubItem(parentId);
    setTargetParentId(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleAddSubItemFromLibrary = (parentId, section) => {
    setTargetParentId(parentId);
    setParentIdForSubItem(null);
    setSelectedSection(section);
    setLibraryView("categories");
    setIsLibraryOpen(true);
  };

  const handleEditClick = (item) => {
    setCurrentItem(item);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (itemId) => {
    setItems((prevItems) => deleteItemFromTree(prevItems, itemId));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentItem((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!currentItem.name) return;

    const newItemData = {
      ...currentItem,
      id: currentItem.id || Date.now(),
      subItems: currentItem.subItems || [],
    };

    if (isEditing) {
      setItems((prevItems) => updateItemInTree(prevItems, newItemData));
    } else {
      if (parentIdForSubItem) {
        setItems((prevItems) =>
          addItemToTree(prevItems, parentIdForSubItem, newItemData)
        );
      } else {
        setItems((prevItems) => [...prevItems, newItemData]);
      }
    }
    setIsModalOpen(false);
  };

  const openSection = (sectionName) => {
    setSelectedSection(sectionName);
    setLibraryView("categories");
  };
  const openCategory = (categoryName) => {
    setSelectedCategory(categoryName);
    setLibraryView("items");
  };
  const goBack = () => {
    if (libraryView === "items") {
      setLibraryView("categories");
      setSelectedCategory(null);
    } else if (libraryView === "categories") {
      setLibraryView("sections");
      setSelectedSection(null);
    }
  };

  const handleLibraryItemClick = (libItem) => {
    if (targetParentId) {
      const newSubItem = {
        ...initialItemState,
        id: Date.now(),
        section: selectedSection,
        name: libItem.name,
        description: libItem.description,
        unit: libItem.unit,
        rate: libItem.rate,
      };
      setItems((prevItems) =>
        addItemToTree(prevItems, targetParentId, newSubItem)
      );
      setTargetParentId(null);
      setIsLibraryOpen(false);
    } else {
      setCurrentItem({
        ...initialItemState,
        section:
          selectedSection ||
          (activeTab === "All" ? "Design Services" : activeTab),
        name: libItem.name,
        description: libItem.description,
        unit: libItem.unit,
        rate: libItem.rate,
      });
      setParentIdForSubItem(null);
      setIsEditing(false);
      setIsLibraryOpen(false);
      setIsModalOpen(true);
    }
  };

  useEffect(() => {
    if (!isLibraryOpen) {
      setTimeout(() => {
        setLibraryView("sections");
        setSelectedSection(null);
        setSelectedCategory(null);
        setTargetParentId(null);
      }, 300);
    }
  }, [isLibraryOpen]);

  // --- RECURSIVE RENDERER ---
  const RecursiveItemRow = ({ item, index, parentNumbering, depth }) => {
    const currentNumbering = parentNumbering
      ? `${parentNumbering}.${index + 1}`
      : `${index + 1}`;
    const paddingLeft = depth * 20 + 8;

    return (
      <React.Fragment>
        <div
          className={`grid grid-cols-12 gap-2 py-3 items-center hover:bg-theme-muted/30 transition-colors relative group no-print-padding ${
            depth > 0
              ? "border-t border-theme-border"
              : "border-b border-theme-border last:border-0"
          }`}
        >
          <div className="col-span-1 text-center text-sm font-medium text-theme-muted-foreground">
            {currentNumbering}
          </div>
          <div className="col-span-1 flex justify-center">
            {item.image ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewImage(item.image);
                }}
                className="relative group/img overflow-hidden rounded-theme-sm border border-theme-border w-10 h-10 bg-theme-card"
              >
                <img
                  src={item.image}
                  alt="item"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors flex items-center justify-center">
                  <Maximize2
                    size={12}
                    className="text-white opacity-0 group-hover/img:opacity-100 drop-shadow-md"
                  />
                </div>
              </button>
            ) : (
              <div className="w-8 h-8 rounded-theme-sm bg-theme-muted flex items-center justify-center">
                <ImageIcon
                  size={14}
                  className="text-theme-muted-foreground/50"
                />
              </div>
            )}
          </div>
          <div
            className="col-span-3 pr-2 relative"
            style={{ paddingLeft: `${paddingLeft}px` }}
          >
            <h4
              className={`text-theme-foreground mb-0.5 leading-tight ${
                depth === 0 ? "font-bold text-sm" : "font-medium text-xs"
              }`}
            >
              {item.name}
            </h4>
            <p className="text-[10px] text-theme-muted-foreground leading-tight font-light line-clamp-2">
              {item.description}
            </p>
            {!isPreviewMode && (
              <div className="mt-1 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddSubItemClick(item.id, item.section);
                  }}
                  className="text-[9px] font-bold text-theme-muted-foreground hover:text-theme-foreground uppercase tracking-wider flex items-center transition-colors"
                >
                  <Plus size={8} className="mr-1" /> Add Child
                </button>
                <span className="text-theme-border text-[9px]">|</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddSubItemFromLibrary(item.id, item.section);
                  }}
                  className="text-[9px] font-bold text-theme-muted-foreground hover:text-theme-foreground uppercase tracking-wider flex items-center transition-colors"
                >
                  <Library size={8} className="mr-1" /> Lib
                </button>
              </div>
            )}
          </div>
          <div className="col-span-1 text-center text-xs text-theme-muted-foreground uppercase">
            {item.unit}
          </div>
          <div className="col-span-1 text-center font-mono text-xs text-theme-foreground">
            {item.length || "-"}
          </div>
          <div className="col-span-1 text-center font-mono text-xs text-theme-foreground">
            {item.width || "-"}
          </div>
          <div className="col-span-1 text-center font-medium text-xs text-theme-foreground">
            {item.quantity}
          </div>
          <div className="col-span-1 text-right font-mono text-xs text-theme-muted-foreground">
            {item.rate > 0 ? item.rate.toLocaleString() : "-"}
          </div>
          <div className="col-span-2 text-right font-mono text-sm font-bold text-theme-foreground pr-2">
            {(item.quantity * item.rate).toLocaleString()}
          </div>

          {!isPreviewMode && (
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 bg-theme-card border border-theme-border shadow-sm p-1 rounded-theme-sm z-10 no-print">
              <button
                onClick={() => handleEditClick(item)}
                className="p-1 hover:bg-theme-muted text-theme-muted-foreground rounded"
              >
                <Edit2 size={12} />
              </button>
              <button
                onClick={() => handleDeleteClick(item.id)}
                className="p-1 hover:bg-red-50 text-red-500 rounded"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>
        {item.subItems && item.subItems.length > 0 && (
          <div className="relative">
            {item.subItems.map((sub, idx) => (
              <RecursiveItemRow
                key={sub.id}
                item={sub}
                index={idx}
                parentNumbering={currentNumbering}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </React.Fragment>
    );
  };

  const getSectionIcon = (section) => {
    switch (section) {
      case "Design Services":
        return <PenTool size={18} />;
      case "Interior Works":
        return <Layers size={18} />;
      case "Construction Works":
        return <Hammer size={18} />;
      default:
        return <Folder size={18} />;
    }
  };

  const getDocumentTitle = () =>
    activeTab === "All"
      ? "Quotation & Scope of Work"
      : `${activeTab} Quotation`;

  return (
    <div
      className={`min-h-screen font-sans selection:bg-theme-secondary transition-colors duration-300 ${
        isDarkMode ? "dark" : ""
      } ${isPreviewMode ? "bg-theme-card" : "bg-theme-background"}`}
    >
      <GlobalStyles />

      {/* HEADER */}
      <header className="fixed top-0 w-full bg-theme-card/80 backdrop-blur-md border-b border-theme-border z-30 no-print">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-xl tracking-tight text-theme-foreground">
              STUDIO.ARCH
            </h1>
            <p className="text-xs text-theme-muted-foreground uppercase tracking-widest mt-0.5">
              Project Proposal
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* TABS */}
            <div className="flex bg-theme-muted p-1 rounded-theme-md">
              {TAB_MAPPING.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-theme-sm transition-all ${
                    activeTab === tab.id
                      ? "bg-theme-card text-theme-foreground shadow-sm"
                      : "text-theme-muted-foreground hover:text-theme-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-theme-border mx-2"></div>

            {/* DARK MODE TOGGLE */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full transition-all text-theme-muted-foreground hover:bg-theme-muted hover:text-theme-foreground"
              title={
                isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
              }
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={togglePreview}
              className={`p-2 rounded-full transition-all flex items-center gap-2 ${
                isPreviewMode
                  ? "bg-theme-primary text-theme-primary-foreground shadow-lg"
                  : "text-theme-muted-foreground hover:bg-theme-muted hover:text-theme-foreground"
              }`}
              title={isPreviewMode ? "Exit Preview" : "Enter Preview Mode"}
            >
              {isPreviewMode ? <EyeOff size={20} /> : <Eye size={20} />}
              <span className="text-xs font-medium hidden sm:inline">
                {isPreviewMode ? "Exit Preview" : "Preview"}
              </span>
            </button>

            <button
              onClick={handlePrint}
              className="p-2 text-theme-muted-foreground hover:text-theme-foreground hover:bg-theme-muted rounded-full transition-colors flex items-center gap-2 border border-transparent hover:border-theme-border"
              title="Print Quotation"
            >
              <Printer size={20} />
              <span className="text-xs font-medium hidden sm:inline">
                Print
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-5xl mx-auto px-6 pt-32 pb-32 print:pt-0 print:pb-0 print:px-0 transition-all duration-300">
        <div
          className={`bg-theme-card shadow-xl shadow-black/5 rounded-theme-lg min-h-[600px] relative print-full-width ${
            isPreviewMode ? "shadow-none" : ""
          }`}
        >
          {/* Doc Header */}
          <div className="p-10 border-b border-theme-border flex justify-between items-start bg-theme-muted/20 print:bg-white print:px-0">
            <div>
              <h2 className="text-3xl font-bold text-theme-foreground mb-2">
                {getDocumentTitle()}
              </h2>
              <p className="text-theme-muted-foreground max-w-lg leading-relaxed text-sm">
                {activeTab === "All"
                  ? "Comprehensive breakdown of Design, Interior, and Construction services proposed for the project execution."
                  : `Detailed cost breakdown and scope of work strictly for ${activeTab}.`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-theme-muted-foreground uppercase tracking-widest mb-1">
                Date
              </p>
              <p className="text-lg font-medium text-theme-foreground mb-4">
                {new Date().toLocaleDateString()}
              </p>
              <span className="inline-block px-3 py-1 bg-theme-muted text-theme-foreground text-xs tracking-wider uppercase font-medium rounded-theme-sm border border-theme-border">
                Draft
              </span>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-4 bg-theme-muted/50 border-y border-theme-border text-[10px] font-bold text-theme-muted-foreground uppercase tracking-widest sticky top-0 z-10 print:static print:bg-transparent print:px-0 print:border-b">
            <div className="col-span-1 text-center">Sl. No.</div>
            <div className="col-span-1 text-center">Image</div>
            <div className="col-span-3 pl-2">Description</div>
            <div className="col-span-1 text-center">Unit</div>
            <div className="col-span-1 text-center">Length</div>
            <div className="col-span-1 text-center">Width</div>
            <div className="col-span-1 text-center">Qty</div>
            <div className="col-span-1 text-right">Rate</div>
            <div className="col-span-2 text-right pr-2">Total</div>
          </div>

          {/* Empty State */}
          {filteredItems.length === 0 && (
            <div className="py-24 text-center no-print">
              <div className="w-16 h-16 bg-theme-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-theme-border">
                <FileText className="text-theme-muted-foreground" size={24} />
              </div>
              <h3 className="text-xl font-medium text-theme-foreground mb-2">
                No items to show
              </h3>
              <p className="text-theme-muted-foreground mb-6 max-w-sm mx-auto">
                {items.length === 0
                  ? "Start by adding items manually, or use the Library to add Design, Interior, or Construction services."
                  : `No items found in ${activeTab}.`}
              </p>
              {!isPreviewMode && items.length === 0 && (
                <div className="flex justify-center gap-4">
                  <Button
                    variant="secondary"
                    icon={Library}
                    onClick={() => setIsLibraryOpen(true)}
                  >
                    Browse Library
                  </Button>
                  <span className="text-theme-border flex items-center">|</span>
                  <Button
                    variant="primary"
                    icon={Plus}
                    onClick={handleAddNewClick}
                  >
                    Create Custom
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Items List */}
          {filteredItems.length > 0 && (
            <div className="divide-y divide-theme-border">
              {sectionsToRender.map((section) => {
                const sectionItems = filteredItems.filter(
                  (item) => item.section === section
                );
                if (sectionItems.length === 0) return null;
                const sectionSubtotal = sectionItems.reduce(
                  (acc, item) => acc + calculateItemTotal(item),
                  0
                );
                const sectionTax = sectionSubtotal * 0.18;
                const sectionTotal = sectionSubtotal + sectionTax;
                const isCollapsed = collapsedSections.includes(section);

                return (
                  <div key={section} className="pb-2">
                    <div
                      onClick={() => toggleSectionCollapse(section)}
                      className="px-4 py-4 bg-theme-muted/20 flex items-center justify-between gap-2 border-b border-theme-border mt-4 cursor-pointer hover:bg-theme-muted/40 transition-colors print:bg-white print:px-0 print:mt-6 print:border-b-2 print:border-theme-foreground print:cursor-default"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-theme-background rounded-theme-md text-theme-foreground shadow-sm no-print">
                          {getSectionIcon(section)}
                        </div>
                        <h3 className="text-lg font-bold text-theme-foreground flex items-center gap-2">
                          {section}
                          <ChevronDown
                            size={16}
                            className={`text-theme-muted-foreground transition-transform duration-200 no-print ${
                              isCollapsed ? "-rotate-90" : ""
                            }`}
                          />
                        </h3>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-mono font-medium text-theme-foreground">
                          {sectionTotal.toLocaleString()}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-theme-muted-foreground no-print">
                          Section Total
                        </span>
                      </div>
                    </div>
                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        isCollapsed
                          ? "max-h-0 opacity-0"
                          : "max-h-[5000px] opacity-100"
                      } print:max-h-none print:opacity-100`}
                    >
                      <div className="px-4 print:px-0">
                        {sectionItems.map((item, index) => (
                          <RecursiveItemRow
                            key={item.id}
                            item={item}
                            index={index}
                            parentNumbering=""
                            depth={0}
                          />
                        ))}
                      </div>
                      <div className="mx-4 mt-2 p-6 bg-theme-muted/20 rounded-theme-md border border-theme-border print:mx-0 print:bg-white print:border-theme-border print:border-dashed">
                        <div className="flex justify-end">
                          <div className="w-64 space-y-2">
                            <div className="flex justify-between text-xs text-theme-muted-foreground">
                              <span>Section Subtotal</span>
                              <span className="font-mono text-theme-foreground">
                                {sectionSubtotal.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs text-theme-muted-foreground">
                              <span>GST (18%)</span>
                              <span className="font-mono text-theme-foreground">
                                {sectionTax.toLocaleString()}
                              </span>
                            </div>
                            <div className="h-px bg-theme-border my-2"></div>
                            <div className="flex justify-between text-sm font-bold text-theme-foreground">
                              <span>{section} Total</span>
                              <span>{sectionTotal.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isPreviewMode && (
            <div className="px-10 py-8 bg-theme-muted/10 border-t border-theme-border flex gap-3 no-print">
              <Button
                variant="secondary"
                icon={Library}
                onClick={() => setIsLibraryOpen(true)}
              >
                Item Library
              </Button>
              <Button variant="primary" icon={Plus} onClick={handleAddNewClick}>
                Add Main Item
              </Button>
            </div>
          )}

          {filteredItems.length > 0 && (
            <div className="bg-theme-muted/10 border-t border-theme-border p-10 print:bg-white print:px-0 print:border-t-2 print:border-theme-foreground mt-8">
              <div className="flex flex-col items-end gap-3">
                <div className="w-64 flex justify-between text-sm text-theme-muted-foreground">
                  <span>Grand Subtotal</span>
                  <span className="font-mono text-theme-foreground">
                    {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="w-64 flex justify-between text-sm text-theme-muted-foreground">
                  <span>Total Tax (18%)</span>
                  <span className="font-mono text-theme-foreground">
                    {tax.toLocaleString()}
                  </span>
                </div>
                <div className="w-64 h-px bg-theme-border my-1"></div>
                <div className="w-64 flex justify-between text-xl font-bold text-theme-foreground">
                  <span>Grand Total</span>
                  <span>{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {filteredItems.length > 0 && (
            <div className="p-10 border-t border-theme-border group relative hover:bg-theme-muted/10 transition-colors print:px-0 print:bg-white">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-theme-foreground">
                  Terms & Conditions
                </h3>
                <span
                  className={`text-xs text-theme-muted-foreground flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity no-print ${
                    isPreviewMode ? "hidden" : ""
                  }`}
                >
                  <Edit2 size={12} /> Editable
                </span>
              </div>
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                readOnly={isPreviewMode}
                className="w-full min-h-[300px] bg-transparent border-none p-0 text-sm text-theme-muted-foreground leading-relaxed font-light focus:ring-0 resize-y focus:text-theme-foreground placeholder:text-theme-muted-foreground/50 font-mono print:text-theme-foreground"
                placeholder="Enter terms and conditions..."
              />
            </div>
          )}
        </div>
      </main>

      {/* RIGHT DRAWER */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isLibraryOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        } no-print`}
      >
        <div
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsLibraryOpen(false)}
        ></div>
        <div
          className={`absolute right-0 top-0 h-full w-[450px] bg-theme-card shadow-2xl border-l border-theme-border transform transition-transform duration-300 ease-out flex flex-col ${
            isLibraryOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-6 border-b border-theme-border flex justify-between items-center bg-theme-muted/20">
            <div>
              <h2 className="text-xl font-bold text-theme-foreground">
                Item Library
              </h2>
              <div className="text-xs text-theme-muted-foreground uppercase tracking-widest mt-1">
                {targetParentId ? (
                  <span className="text-blue-600 font-bold flex items-center">
                    <CornerDownRight size={10} className="mr-1" /> Adding Child
                    Item
                  </span>
                ) : (
                  libraryView === "sections" && "Select a Phase"
                )}
                {!targetParentId &&
                  libraryView === "categories" &&
                  selectedSection}
                {!targetParentId && libraryView === "items" && selectedCategory}
              </div>
            </div>
            <button
              onClick={() => setIsLibraryOpen(false)}
              className="p-2 hover:bg-theme-muted rounded-full transition-colors text-theme-muted-foreground"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div
              className={`absolute inset-0 overflow-y-auto p-6 transition-transform duration-300 ${
                libraryView === "sections"
                  ? "translate-x-0"
                  : "-translate-x-full"
              }`}
            >
              <h3 className="text-xs font-bold text-theme-muted-foreground uppercase tracking-widest mb-4">
                Master Sections
              </h3>
              <div className="space-y-3">
                {Object.keys(LIBRARY_DATA).map((section) => (
                  <button
                    key={section}
                    onClick={() => openSection(section)}
                    className="w-full flex items-center justify-between p-5 bg-theme-card border border-theme-border rounded-theme-md hover:border-theme-foreground/50 hover:shadow-md transition-all group text-left"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-theme-muted rounded-full flex items-center justify-center text-theme-muted-foreground mr-4 group-hover:bg-theme-primary group-hover:text-theme-primary-foreground transition-colors">
                        {getSectionIcon(section)}
                      </div>
                      <div>
                        <span className="text-lg font-medium text-theme-foreground block">
                          {section}
                        </span>
                        <span className="text-xs text-theme-muted-foreground">
                          {Object.keys(LIBRARY_DATA[section]).length} Categories
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-theme-muted-foreground group-hover:text-theme-foreground"
                    />
                  </button>
                ))}
              </div>
            </div>
            <div
              className={`absolute inset-0 overflow-y-auto p-6 transition-transform duration-300 ${
                libraryView === "categories"
                  ? "translate-x-0"
                  : libraryView === "sections"
                  ? "translate-x-full"
                  : "-translate-x-full"
              }`}
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-theme-border">
                <button
                  onClick={goBack}
                  className="p-2 hover:bg-theme-muted rounded-full text-theme-muted-foreground transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>
                <h3 className="font-bold text-theme-foreground">
                  {selectedSection} Categories
                </h3>
              </div>
              <div className="space-y-3">
                {selectedSection &&
                  Object.keys(LIBRARY_DATA[selectedSection]).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => openCategory(cat)}
                      className="w-full flex items-center justify-between p-4 bg-theme-card border border-theme-border rounded-theme-md hover:border-theme-foreground/50 hover:shadow-sm transition-all group text-left"
                    >
                      <span className="font-medium text-theme-foreground">
                        {cat}
                      </span>
                      <div className="flex items-center text-xs text-theme-muted-foreground group-hover:text-theme-foreground">
                        {LIBRARY_DATA[selectedSection][cat].length} Items
                        <ChevronRight size={14} className="ml-2" />
                      </div>
                    </button>
                  ))}
              </div>
            </div>
            <div
              className={`absolute inset-0 flex flex-col transition-transform duration-300 bg-theme-muted/10 ${
                libraryView === "items" ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex items-center gap-3 p-4 bg-theme-card border-b border-theme-border">
                <button
                  onClick={goBack}
                  className="p-2 hover:bg-theme-muted rounded-full text-theme-muted-foreground transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <h3 className="text-lg font-bold text-theme-foreground leading-none mb-1">
                    {selectedCategory}
                  </h3>
                  <span className="text-xs text-theme-muted-foreground uppercase tracking-widest">
                    {selectedSection}
                  </span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedCategory &&
                  LIBRARY_DATA[selectedSection][selectedCategory].map(
                    (libItem, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleLibraryItemClick(libItem)}
                        className="group p-4 border border-theme-border rounded-theme-md hover:border-theme-foreground/50 hover:shadow-md cursor-pointer transition-all bg-theme-card relative"
                      >
                        {targetParentId && (
                          <div className="absolute top-2 right-2 text-blue-600 font-bold text-xs bg-blue-50 px-2 py-1 rounded-theme-sm">
                            Add to Parent
                          </div>
                        )}
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium text-theme-foreground group-hover:text-theme-primary">
                            {libItem.name}
                          </h4>
                          <span className="text-xs font-mono bg-theme-muted px-2 py-1 text-theme-foreground rounded-theme-sm">
                            {libItem.unit}
                          </span>
                        </div>
                        <p className="text-sm text-theme-muted-foreground mb-3 line-clamp-2 font-light">
                          {libItem.description}
                        </p>
                        <div className="flex justify-between items-center border-t border-theme-border pt-3 mt-1">
                          <span className="text-xs text-theme-muted-foreground">
                            Base Rate
                          </span>
                          <div className="flex items-center text-theme-foreground font-medium text-sm">
                            {libItem.rate.toLocaleString()}
                            <ChevronRight
                              size={14}
                              className="ml-1 text-theme-muted-foreground group-hover:text-theme-foreground"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="bg-theme-card w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 rounded-theme-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-theme-primary px-6 py-4 flex justify-between items-center shrink-0">
              <h2 className="text-theme-primary-foreground text-lg font-medium tracking-wide">
                {isEditing
                  ? "Edit Item"
                  : parentIdForSubItem
                  ? "Add Child Item"
                  : "Add Main Item"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-theme-primary-foreground/70 hover:text-theme-primary-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={handleSaveItem}
              className="p-8 space-y-5 overflow-y-auto"
            >
              {!parentIdForSubItem && (
                <div>
                  <label className="block text-xs font-bold text-theme-muted-foreground uppercase tracking-widest mb-2">
                    Quotation Section
                  </label>
                  <select
                    value={currentItem.section}
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        section: e.target.value,
                      })
                    }
                    className="w-full border-b border-theme-border pb-2 text-theme-foreground font-medium focus:outline-none focus:border-theme-foreground bg-transparent"
                  >
                    {SECTIONS_ORDER.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-theme-muted-foreground uppercase tracking-widest mb-2">
                  Item Image
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-theme-muted/50 rounded-theme-md border border-theme-border flex items-center justify-center overflow-hidden">
                    {currentItem.image ? (
                      <img
                        src={currentItem.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon
                        size={24}
                        className="text-theme-muted-foreground"
                      />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="text-xs text-theme-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-theme-secondary file:text-theme-secondary-foreground hover:file:bg-theme-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-theme-muted-foreground uppercase tracking-widest mb-2">
                  {parentIdForSubItem ? "Child Item Name" : "Item Name"}
                </label>
                <input
                  autoFocus
                  type="text"
                  value={currentItem.name}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, name: e.target.value })
                  }
                  className="w-full border-b border-theme-border pb-2 text-lg font-medium text-theme-foreground focus:outline-none focus:border-theme-foreground placeholder:text-theme-muted-foreground/50 transition-colors"
                  placeholder="e.g. Item Name"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-theme-muted-foreground uppercase tracking-widest mb-2">
                  Narrative / Description
                </label>
                <textarea
                  value={currentItem.description}
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      description: e.target.value,
                    })
                  }
                  className="w-full border border-theme-border p-3 text-sm text-theme-foreground focus:outline-none focus:border-theme-foreground focus:ring-1 focus:ring-theme-foreground rounded-theme-md bg-theme-muted/20 h-24 resize-none transition-all"
                  placeholder="Describe value..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-theme-muted-foreground uppercase tracking-widest mb-2">
                    Length
                  </label>
                  <input
                    type="text"
                    value={currentItem.length}
                    onChange={(e) =>
                      setCurrentItem({ ...currentItem, length: e.target.value })
                    }
                    className="w-full border-b border-theme-border pb-2 text-theme-foreground focus:outline-none focus:border-theme-foreground font-mono"
                    placeholder="e.g. 10'"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-theme-muted-foreground uppercase tracking-widest mb-2">
                    Width
                  </label>
                  <input
                    type="text"
                    value={currentItem.width}
                    onChange={(e) =>
                      setCurrentItem({ ...currentItem, width: e.target.value })
                    }
                    className="w-full border-b border-theme-border pb-2 text-theme-foreground focus:outline-none focus:border-theme-foreground font-mono"
                    placeholder="e.g. 12'"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-theme-muted-foreground uppercase tracking-widest mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={currentItem.quantity}
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        quantity: Number(e.target.value),
                      })
                    }
                    className="w-full border-b border-theme-border pb-2 text-theme-foreground focus:outline-none focus:border-theme-foreground font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-theme-muted-foreground uppercase tracking-widest mb-2">
                    Unit
                  </label>
                  <select
                    value={currentItem.unit}
                    onChange={(e) =>
                      setCurrentItem({ ...currentItem, unit: e.target.value })
                    }
                    className="w-full border-b border-theme-border pb-2 text-theme-foreground focus:outline-none focus:border-theme-foreground bg-transparent"
                  >
                    <option value="ls">Lumpsum</option>
                    <option value="sqft">Sq. Ft.</option>
                    <option value="sqm">Sq. M.</option>
                    <option value="hr">Hour</option>
                    <option value="view">View</option>
                    <option value="sheet">Sheet</option>
                    <option value="cft">Cu. Ft.</option>
                    <option value="rft">R. Ft.</option>
                    <option value="point">Point</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-theme-muted-foreground uppercase tracking-widest mb-2">
                    Rate
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={currentItem.rate}
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        rate: Number(e.target.value),
                      })
                    }
                    className="w-full border-b border-theme-border pb-2 text-theme-foreground focus:outline-none focus:border-theme-foreground font-mono"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-between items-center border-t border-theme-border mt-2">
                <span className="text-sm text-theme-muted-foreground">
                  Total
                </span>
                <span className="text-xl font-bold text-theme-foreground">
                  {(currentItem.quantity * currentItem.rate).toLocaleString()}
                </span>
              </div>
              <div className="flex gap-4">
                <Button
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => {}} className="flex-1">
                  {isEditing ? "Save" : "Add"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMAGE PREVIEW */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] rounded-theme-md shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
