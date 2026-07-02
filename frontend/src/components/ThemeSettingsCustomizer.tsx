import React, { useState } from "react";
import { Palette, Layers, Type, CreditCard, ChevronDown, Check, Sparkles, Sliders } from "lucide-react";

interface ThemeSettingsCustomizerProps {
  customBg: string;
  customOuterContainer: string;
  customInnerContainer: string;
  customNestedContainer: string;
  customTitleFont: string;
  customSubtitleFont: string;
  customMiniSubtitleFont: string;
  customTextSentenceFont: string;
  customMenuBarBg: string;
  customMenuBarTitle: string;
  customWebAppName: string;
  onChange: (key: string, value: string) => void;
  onApplyBulk?: (themeObj: Record<string, string>) => void;
}

// 6 Curated Perfect Combo Sets (Set-by-Set Perfect Combinations)
export const PERFECT_COMBOS = [
  {
    id: "combo-neon-cyber",
    name: "Cyberpunk Neon Aura",
    description: "Deep obsidian slate with glowing pink titles, neon magenta sentence text and violet headers",
    tag: "High Contrast Tech",
    theme: {
      bg: "#09090B",
      outer_container: "#1E1B4B",
      inner_container: "#311042",
      nested_container: "#11001C",
      title_font: "linear-gradient(135deg, #F43F5E 0%, #FB7185 100%)",
      subtitle_font: "#A5B4FC",
      mini_subtitle_font: "#F472B6",
      text_sentence_font: "#E2E8F0",
      menu_bar_bg: "#11001C",
      menu_bar_title: "#F43F5E",
      web_app_name: "linear-gradient(135deg, #F43F5E 0%, #38BDF8 100%)"
    }
  },
  {
    id: "combo-emerald-gold",
    name: "Emerald Prestige Gold",
    description: "Luxurious royal emerald green paired with shining gold titles and mint accents",
    tag: "Elegant Luxury",
    theme: {
      bg: "#022C22",
      outer_container: "#064E3B",
      inner_container: "#0F172A",
      nested_container: "#1E293B",
      title_font: "linear-gradient(135deg, #FDE047 0%, #F59E0B 100%)",
      subtitle_font: "#34D399",
      mini_subtitle_font: "#6EE7B7",
      text_sentence_font: "#F1F5F9",
      menu_bar_bg: "#022C22",
      menu_bar_title: "#FDE047",
      web_app_name: "linear-gradient(135deg, #34D399 0%, #F59E0B 100%)"
    }
  },
  {
    id: "combo-pastel-harmony",
    name: "Calm Pastel Harmony",
    description: "Soothing sandel beige and pastel pink containers paired with clean slate labels",
    tag: "Soft Light Accent",
    theme: {
      bg: "#EADBC8",
      outer_container: "#FFFFFF",
      inner_container: "#DBEAFE",
      nested_container: "#FBCFE8",
      title_font: "#311042",
      subtitle_font: "#0F172A",
      mini_subtitle_font: "#1E293B",
      text_sentence_font: "#334155",
      menu_bar_bg: "#EADBC8",
      menu_bar_title: "#311042",
      web_app_name: "linear-gradient(135deg, #FF9A9E 0%, #EADBC8 100%)"
    }
  },
  {
    id: "combo-ocean-breeze",
    name: "Oceanic Abyssal Breeze",
    description: "Deep oceanic slate body combined with refreshing sky blue, teal and mint text gradients",
    tag: "Fresh Cool Theme",
    theme: {
      bg: "#0F172A",
      outer_container: "#1E293B",
      inner_container: "#022C22",
      nested_container: "#115E59",
      title_font: "linear-gradient(135deg, #38BDF8 0%, #34D399 100%)",
      subtitle_font: "#BAE6FD",
      mini_subtitle_font: "#A7F3D0",
      text_sentence_font: "#E2E8F0",
      menu_bar_bg: "#0F172A",
      menu_bar_title: "#38BDF8",
      web_app_name: "linear-gradient(135deg, #38BDF8 0%, #A5B4FC 100%)"
    }
  },
  {
    id: "combo-crimson-velvet",
    name: "Crimson Royal Velvet",
    description: "Dramatic crimson blood base paired with royal burgundy layouts and bright amber fonts",
    tag: "Controversial Bold",
    theme: {
      bg: "#450A0A",
      outer_container: "#7F1D1D",
      inner_container: "#581C87",
      nested_container: "#881337",
      title_font: "linear-gradient(135deg, #FDE047 0%, #FDA085 100%)",
      subtitle_font: "#FF80B5",
      mini_subtitle_font: "#FED7AA",
      text_sentence_font: "#F8FAFC",
      menu_bar_bg: "#581C87",
      menu_bar_title: "#FDE047",
      web_app_name: "linear-gradient(135deg, #FDE047 0%, #7F1D1D 100%)"
    }
  },
  {
    id: "combo-sunny-orange",
    name: "Sunset Orange Glow",
    description: "Vibrant light-orange canvas with warm mandarin headers, peach panels, and high-contrast deep bronze typography",
    tag: "Sunny Warmth",
    theme: {
      bg: "#FFEDD5",
      outer_container: "#FFFFFF",
      inner_container: "#FFF7ED",
      nested_container: "#FED7AA",
      title_font: "linear-gradient(135deg, #EA580C 0%, #9A3412 100%)",
      subtitle_font: "#7C2D12",
      mini_subtitle_font: "#C2410C",
      text_sentence_font: "#431407",
      menu_bar_bg: "#FDBA74",
      menu_bar_title: "#431407",
      web_app_name: "linear-gradient(135deg, #EA580C 0%, #431407 100%)"
    }
  },
  {
    id: "combo-spring-morning",
    name: "Spring Blossom Light",
    description: "Vibrant light-mode theme using mint fresh fields, soft lavender cards and rose fonts",
    tag: "Warm Cozy Vibe",
    theme: {
      bg: "#F0FAF5",
      outer_container: "#FFFFFF",
      inner_container: "#E9D5FF",
      nested_container: "#FBCFE8",
      title_font: "linear-gradient(135deg, #581C87 0%, #881337 100%)",
      subtitle_font: "#4C1D95",
      mini_subtitle_font: "#7F1D1D",
      text_sentence_font: "#334155",
      menu_bar_bg: "#E9D5FF",
      menu_bar_title: "#4C1D95",
      web_app_name: "#881337"
    }
  }
];

// 10 Light Colors
export const LIGHT_COLORS = [
  { name: "Light Green", value: "#D1FAE5" },
  { name: "Sky Blue", value: "#BAE6FD" },
  { name: "Soft Pink", value: "#FBCFE8" },
  { name: "Slate Gray", value: "#E2E8F0" },
  { name: "Sandel Beige", value: "#EADBC8" },
  { name: "Light Blue", value: "#DBEAFE" },
  { name: "Soft Lavender", value: "#E9D5FF" },
  { name: "Light Orange", value: "#FFEDD5" },
  { name: "Lemon Yellow", value: "#FEF08A" },
  { name: "Minimal White", value: "#FFFFFF" }
];

// 10 Dark Colors
export const DARK_COLORS = [
  { name: "Midnight Blue", value: "#0F172A" },
  { name: "Charcoal Gray", value: "#1E293B" },
  { name: "Forest Green", value: "#064E3B" },
  { name: "Deep Wine", value: "#4C1D95" },
  { name: "Obsidian Black", value: "#09090B" },
  { name: "Chocolate Brown", value: "#451A03" },
  { name: "Royal Purple", value: "#311042" },
  { name: "Slate Dark", value: "#334155" },
  { name: "Crimson Blood", value: "#7F1D1D" },
  { name: "Dark Emerald", value: "#022C22" }
];

// 10 Light Mixed Gradients
export const LIGHT_MIXED = [
  { name: "Sunset Glow", value: "linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)" },
  { name: "Spring Morning", value: "linear-gradient(135deg, #A1C4FD 0%, #C2E9FB 100%)" },
  { name: "Soft Forest", value: "linear-gradient(135deg, #D4FC79 0%, #96E6A1 100%)" },
  { name: "Cotton Candy", value: "linear-gradient(135deg, #F6D365 0%, #FDA085 100%)" },
  { name: "Calm Waves", value: "linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)" },
  { name: "Lemon Mint", value: "linear-gradient(135deg, #FFF1EB 0%, #ACE0F9 100%)" },
  { name: "Pale Orchid", value: "linear-gradient(135deg, #F3E7E9 0%, #E3EEFF 100%)" },
  { name: "Warm Sand", value: "linear-gradient(135deg, #F5F7FA 0%, #C3CFE2 100%)" },
  { name: "Peach Honey", value: "linear-gradient(135deg, #FFECD2 0%, #FCB69F 100%)" },
  { name: "Aurora Green", value: "linear-gradient(135deg, #E0F2FE 0%, #D1FAE5 100%)" }
];

// 10 Dark Mixed Gradients
export const DARK_MIXED = [
  { name: "Neon Midnight", value: "linear-gradient(135deg, #1E1B4B 0%, #311042 100%)" },
  { name: "Deep Forest", value: "linear-gradient(135deg, #022C22 0%, #064E3B 100%)" },
  { name: "Magma Flow", value: "linear-gradient(135deg, #450A0A 0%, #7F1D1D 100%)" },
  { name: "Cosmic Purple", value: "linear-gradient(135deg, #2E0854 0%, #11001C 100%)" },
  { name: "Oceanic Abyssal", value: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)" },
  { name: "Golden Bronze", value: "linear-gradient(135deg, #1C1917 0%, #451A03 100%)" },
  { name: "Eclipse Shadow", value: "linear-gradient(135deg, #09090B 0%, #1E1B4B 100%)" },
  { name: "Steel Metal", value: "linear-gradient(135deg, #334155 0%, #0F172A 100%)" },
  { name: "Aurora Borealis", value: "linear-gradient(135deg, #115E59 0%, #022C22 100%)" },
  { name: "Burgundy Velvet", value: "linear-gradient(135deg, #581C87 0%, #881337 100%)" }
];

const CUSTOMIZE_CATEGORIES = [
  { key: "bg", label: "Page Background (bg)", icon: Palette, description: "App main screen layout background" },
  { key: "outer_container", label: "Outer Containers BG", icon: Layers, description: "Cards, panels & outer block shells" },
  { key: "inner_container", label: "Inner Containers BG", icon: Layers, description: "Inner lists, sections & nested forms" },
  { key: "nested_container", label: "Nested Inner Containers BG", icon: Layers, description: "Individual table rows, inputs & tag badges" },
  { key: "title_font", label: "Titles Font Color", icon: Type, description: "Main section headings (20px)" },
  { key: "subtitle_font", label: "Subtitles Font Color", icon: Type, description: "Subheadings & secondary titles (18px)" },
  { key: "mini_subtitle_font", label: "Mini Subtitles Font Color", icon: Type, description: "Minor indicators & mini headings (16px)" },
  { key: "text_sentence_font", label: "Text Sentences Font Color", icon: Type, description: "Paragraphs, labels, and sentences (16px)" },
  { key: "menu_bar_bg", label: "Menu Bar BG Color", icon: CreditCard, description: "Drawer menus, headers & navigation footers bg" },
  { key: "menu_bar_title", label: "Menu Bar Titles Color", icon: CreditCard, description: "Drawer labels & navigation footer text colors" },
  { key: "web_app_name", label: "Web Application Name Color", icon: CreditCard, description: "Smart Manager header logo branding text" },
];

export function ThemeSettingsCustomizer({
  customBg,
  customOuterContainer,
  customInnerContainer,
  customNestedContainer,
  customTitleFont,
  customSubtitleFont,
  customMiniSubtitleFont,
  customTextSentenceFont,
  customMenuBarBg,
  customMenuBarTitle,
  customWebAppName,
  onChange,
  onApplyBulk,
}: ThemeSettingsCustomizerProps) {
  const [activeCategory, setActiveCategory] = useState<string>("bg");
  const [activeTab, setActiveTab] = useState<"light" | "dark" | "mixed-light" | "mixed-dark">("dark");

  const getCurrentValue = (key: string): string => {
    switch (key) {
      case "bg": return customBg;
      case "outer_container": return customOuterContainer;
      case "inner_container": return customInnerContainer;
      case "nested_container": return customNestedContainer;
      case "title_font": return customTitleFont;
      case "subtitle_font": return customSubtitleFont;
      case "mini_subtitle_font": return customMiniSubtitleFont;
      case "text_sentence_font": return customTextSentenceFont;
      case "menu_bar_bg": return customMenuBarBg;
      case "menu_bar_title": return customMenuBarTitle;
      case "web_app_name": return customWebAppName;
      default: return "";
    }
  };

  const getOptionsForTab = () => {
    switch (activeTab) {
      case "light": return LIGHT_COLORS;
      case "dark": return DARK_COLORS;
      case "mixed-light": return LIGHT_MIXED;
      case "mixed-dark": return DARK_MIXED;
    }
  };

  const currentValue = getCurrentValue(activeCategory);

  const isComboActive = (comboTheme: Record<string, string>) => {
    return (
      customBg === comboTheme.bg &&
      customOuterContainer === comboTheme.outer_container &&
      customInnerContainer === comboTheme.inner_container &&
      customNestedContainer === comboTheme.nested_container &&
      customTitleFont === comboTheme.title_font &&
      customSubtitleFont === comboTheme.subtitle_font &&
      customMiniSubtitleFont === comboTheme.mini_subtitle_font &&
      customTextSentenceFont === comboTheme.text_sentence_font &&
      customMenuBarBg === comboTheme.menu_bar_bg &&
      customMenuBarTitle === comboTheme.menu_bar_title &&
      customWebAppName === comboTheme.web_app_name
    );
  };

  const handleApplyCombo = (comboTheme: Record<string, string>) => {
    if (onApplyBulk) {
      onApplyBulk(comboTheme);
    } else {
      Object.entries(comboTheme).forEach(([key, val]) => {
        onChange(key, val);
      });
    }
  };

  return (
    <div className="space-y-4 p-4 bg-slate-900 rounded-2xl border border-slate-800 text-left">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
        <Palette className="w-5 h-5 text-indigo-400 shrink-0" />
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono flex items-center gap-1.5">
            Advanced Theme Customizer
          </h3>
          <p className="text-[10px] text-slate-400">Quickly select curated combinations or customize specific details</p>
        </div>
      </div>

      {/* CURATED PERFECT COMBOS (SET-BY-SET) */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
          <label className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider block font-mono">Curated Perfect Combos (Set-by-Set)</label>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
          {PERFECT_COMBOS.map((combo) => {
            const active = isComboActive(combo.theme);
            return (
              <button
                key={combo.id}
                onClick={() => handleApplyCombo(combo.theme)}
                className={`p-2.5 rounded-xl border text-left transition duration-150 flex flex-col gap-1.5 cursor-pointer relative ${
                  active 
                    ? "border-emerald-500 bg-emerald-950/20 shadow-lg ring-1 ring-emerald-500/30 text-emerald-300" 
                    : "border-slate-850 bg-slate-950 hover:bg-slate-900 text-slate-300"
                }`}
              >
                {/* Header line */}
                <div className="flex items-center justify-between w-full gap-2">
                  <span className="text-[11px] font-bold text-slate-100 truncate flex items-center gap-1">
                    {combo.name}
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-ping" />}
                  </span>
                  <span className={`text-[7.5px] font-mono px-1.5 py-0.5 rounded-full uppercase font-bold shrink-0 ${
                    active ? "bg-emerald-500/30 text-emerald-300" : "bg-indigo-950/45 text-indigo-300"
                  }`}>
                    {combo.tag}
                  </span>
                </div>

                {/* Description text */}
                <p className="text-[9.5px] text-slate-400 leading-normal line-clamp-2">
                  {combo.description}
                </p>

                {/* Visual Color Previews */}
                <div className="flex items-center gap-1.5 mt-auto pt-1 border-t border-slate-900/40">
                  <span className="text-[8px] font-mono text-slate-500 font-bold uppercase shrink-0">Colors:</span>
                  <div className="flex gap-1 items-center overflow-x-auto py-0.5">
                    {[
                      { label: "BG", value: combo.theme.bg },
                      { label: "Outer", value: combo.theme.outer_container },
                      { label: "Inner", value: combo.theme.inner_container },
                      { label: "Nested", value: combo.theme.nested_container },
                    ].map((col, i) => {
                      const isGrad = col.value.includes("gradient");
                      return (
                        <div 
                          key={i} 
                          title={`${col.label}: ${col.value}`} 
                          className="w-3.5 h-3.5 rounded-md border border-slate-800 shrink-0 shadow-sm"
                          style={{ background: col.value }}
                        />
                      );
                    })}
                    <div className="w-[1px] h-3 bg-slate-800 mx-1 shrink-0" />
                    {[
                      { label: "Title", value: combo.theme.title_font },
                      { label: "Sentences", value: combo.theme.text_sentence_font },
                    ].map((col, i) => {
                      const isGrad = col.value.includes("gradient");
                      return (
                        <div 
                          key={i}
                          title={`${col.label}: ${col.value}`}
                          className="px-1 text-[8px] font-extrabold rounded bg-slate-900 border border-slate-800 shrink-0"
                          style={{ color: isGrad ? undefined : col.value }}
                        >
                          Aa
                        </div>
                      );
                    })}
                  </div>

                  {active && (
                    <div className="ml-auto flex items-center gap-0.5 text-[8.5px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-1 py-0.2 rounded">
                      <Check className="w-3 h-3 shrink-0" />
                      Active
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full h-[1px] bg-slate-800 my-2" />

      {/* INDIVIDUAL CONTROLS */}
      <div className="flex items-center gap-1.5">
        <Sliders className="w-4 h-4 text-indigo-400 shrink-0" />
        <label className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider block font-mono">Or Fine-tune Specific Elements</label>
      </div>

      {/* CATEGORY SELECTOR ACCORDION / GRID */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">1. Select Element to Style</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
          {CUSTOMIZE_CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.key;
            const currentVal = getCurrentValue(cat.key);
            const isGradient = currentVal.includes("gradient");

            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`p-2 rounded-xl border text-left flex items-center gap-2 transition duration-150 cursor-pointer ${
                  isSelected 
                    ? "border-indigo-500 bg-indigo-950/20 text-indigo-400 shadow-md" 
                    : "border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-300"
                }`}
              >
                <cat.icon className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold truncate leading-tight">{cat.label}</div>
                  <div className="text-[9px] text-slate-500 truncate leading-tight">{cat.description}</div>
                </div>
                <div 
                  className="w-4 h-4 rounded border border-slate-800 shrink-0" 
                  style={{ background: currentVal }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-TABS: LIGHT, DARK, MIXED-LIGHT, MIXED-DARK */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">2. Choose Color Preset Palette</label>
          <span className="text-[9px] font-mono text-slate-500 font-bold max-w-[150px] truncate" title={currentValue}>
            Active: {currentValue}
          </span>
        </div>
        
        <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-850">
          {[
            { id: "light", label: "Light" },
            { id: "dark", label: "Dark" },
            { id: "mixed-light", label: "Light Mix" },
            { id: "mixed-dark", label: "Dark Mix" }
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-1.5 rounded-lg text-[9.5px] font-bold text-center uppercase tracking-wider transition ${
                  isSelected 
                    ? "bg-indigo-600 text-white" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* PRESETS CONTAINER */}
      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850 space-y-2">
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-5 gap-2">
          {getOptionsForTab().map((option, idx) => {
            const isSelected = currentValue === option.value;
            const isGradient = option.value.includes("gradient");

            return (
              <button
                key={option.value + idx}
                onClick={() => onChange(activeCategory, option.value)}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition duration-150 cursor-pointer text-center relative ${
                  isSelected 
                    ? "border-emerald-500 bg-emerald-950/20 text-emerald-400" 
                    : "border-slate-800 bg-slate-900 hover:bg-slate-850 text-slate-300"
                }`}
              >
                <div 
                  className="w-full h-8 rounded-lg border border-slate-750 flex items-center justify-center"
                  style={{ background: option.value }}
                >
                  {isSelected && <Check className="w-4 h-4 text-emerald-400 drop-shadow-md" />}
                </div>
                <span className="text-[9.5px] font-semibold truncate w-full">{option.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
