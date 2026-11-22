import React, { useState } from 'react';
import type { User, TaskPriority, DirectiveType, ExecutiveAuthority } from '../types';
import { EXECUTIVE_LIST } from '../types';
import { TaskStore } from '../services/store';
import { DEPARTMENTS } from '../services/mockData';
import { getFormattedDate } from '../utils/followUp';
import { X, Plus, Mail, FileCheck, Paperclip, CheckSquare, Square, Info, Upload, Search, Trash2, CheckCircle2, Crown, User as UserIcon } from 'lucide-react';

interface TaskFormModalProps {
  currentUser: User;
  onClose: () => void;
  onTaskCreated: () => void;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  currentUser,
  onClose,
  onTaskCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Multi-department selection state loaded from txt list
  const [selectedDepts, setSelectedDepts] = useState<string[]>([currentUser.department || DEPARTMENTS[0]]);
  const [deptSearchText, setDeptSearchText] = useState('');
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);

  const initialExec: ExecutiveAuthority = (currentUser.allowedExecutives && currentUser.allowedExecutives.length === 1)
    ? currentUser.allowedExecutives[0]
    : 'ผอ.';
  const [executiveAuthority, setExecutiveAuthority] = useState<ExecutiveAuthority>(initialExec);
  const [directiveRef, setDirectiveRef] = useState(`ข้อสั่งการ ${initialExec} ที่ `);
  const [directiveType, setDirectiveType] = useState<DirectiveType>('คำสั่งการ ผอ.');
  const [assigneeName, setAssigneeName] = useState('');
  
  // REAL File Upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const todayFormatted = getFormattedDate();
  const nextTwoWeeksFormatted = getFormattedDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
  const [dateReceived, setDateReceived] = useState(todayFormatted);
  const [deadline, setDeadline] = useState(nextTwoWeeksFormatted);
  const [priority, setPriority] = useState<TaskPriority>('ปกติ');
  const [sendEmailAlert, setSendEmailAlert] = useState<boolean>(true);

  // Filter departments based on search text
  const filteredDepartments = DEPARTMENTS.filter(d => 
    d.toLowerCase().includes(deptSearchText.toLowerCase())
  );

  const toggleDept = (dept: string) => {
    if (selectedDepts.includes(dept)) {
      if (selectedDepts.length > 1) {
        setSelectedDepts(selectedDepts.filter((d) => d !== dept));
      }
    } else {
      setSelectedDepts([...selectedDepts, dept]);
    }
  };

  const isAllSelected = selectedDepts.length === DEPARTMENTS.length;
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedDepts([DEPARTMENTS[0]]);
    } else {
      setSelectedDepts([...DEPARTMENTS]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedDepts.length === 0 || !deadline) return;

    TaskStore.createDirectivesForDepartments({
      targetDepartments: selectedDepts,
      title,
      description,
      directiveRef,
      directiveType,
      executiveAuthority,
      directiveFileName: uploadedFile ? uploadedFile.name : undefined,
      dateReceived,
      deadline,
      priority,
      sendEmailAlert,
      assigneeName: assigneeName.trim() || undefined,
    });

    onTaskCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      
      {/* Modal Container with strict max-h-[90vh] & flex flex-col to prevent overflow */}
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden my-auto">
        
        {/* Sticky Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-5 shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl shrink-0">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight leading-tight">
                บันทึกข้อสั่งการผู้บริหาร (ผอ. & รอง ผอ.)
              </h2>
              <p className="text-blue-200 text-xs mt-0.5">
                สำหรับเลขาหน้าห้อง / ผู้ปฏิบัติงาน บันทึกข้อสั่งการและมอบหมายงานไปยังหน่วยงาน 51 แห่ง
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Executive Line Selection (ผอ. / รผอ.บร. / รผอ.พกป. / รผอ.สปทร.) */}
          <div className="bg-gradient-to-r from-slate-50 via-blue-50/40 to-indigo-50/40 p-4 rounded-2xl border border-blue-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-blue-600" />
                <span>สายงานผู้บริหารเจ้าของข้อสั่งการ <span className="text-red-500">*</span></span>
              </label>
              <span className="text-[11px] text-blue-700 font-semibold bg-blue-100/70 px-2 py-0.5 rounded-full">
                {currentUser.name} (ผู้บันทึก)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {EXECUTIVE_LIST.map((exec) => {
                const isSelected = executiveAuthority === exec.id;
                const isPermitted = !currentUser.allowedExecutives || currentUser.allowedExecutives.includes(exec.id);
                return (
                  <button
                    key={exec.id}
                    type="button"
                    disabled={!isPermitted}
                    onClick={() => {
                      if (!isPermitted) return;
                      setExecutiveAuthority(exec.id);
                      setDirectiveRef(`ข้อสั่งการ ${exec.id} ที่ `);
                    }}
                    title={isPermitted ? `สร้างงานในสายงาน ${exec.roleTitle}` : `คุณไม่มีสิทธิ์เพิ่ม/แก้ไขงานของสายงาน ${exec.id}`}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      !isPermitted
                        ? 'opacity-40 bg-slate-100 border-slate-200 cursor-not-allowed'
                        : isSelected
                        ? `${exec.lightBg} ${exec.border} ring-2 ring-blue-500/40 shadow-xs cursor-pointer`
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                        isSelected ? `${exec.badgeBg} ${exec.badgeText}` : 'bg-slate-100 text-slate-700'
                      }`}>
                        {exec.label}
                      </span>
                      {isSelected ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      ) : !isPermitted ? (
                        <span className="text-[10px] text-slate-400 font-bold">🔒 วิวเท่านั้น</span>
                      ) : null}
                    </div>
                    <div className="text-[11px] font-bold mt-1.5 line-clamp-1 leading-tight">
                      {exec.roleTitle}
                    </div>
                    <div className="text-[9px] text-slate-400 truncate mt-0.5">
                      {exec.shortDesc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Executive Directive Section & REAL File Upload Input */}
          <div className="bg-blue-50/80 p-4 rounded-2xl border border-blue-200 space-y-3">
            <h3 className="text-xs font-bold text-blue-900 flex items-center gap-1.5 uppercase tracking-wider">
              <FileCheck className="w-4 h-4 text-blue-600" />
              อ้างอิงคำสั่งการ / ข้อสั่งการ ({executiveAuthority}) & แนบบันทึกสั่งการ
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ประเภทคำสั่งการ <span className="text-red-500">*</span>
                </label>
                <select
                  value={directiveType}
                  onChange={(e) => setDirectiveType(e.target.value as DirectiveType)}
                  className="w-full px-3 py-2 bg-white border border-blue-200 text-xs rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden font-medium cursor-pointer"
                >
                  <option value="คำสั่งการ ผอ.">คำสั่งการ ผอ.</option>
                  <option value="ข้อสั่งการที่ประชุมบริหาร">ข้อสั่งการที่ประชุมบริหาร</option>
                  <option value="หนังสือสั่งการราชการ">หนังสือสั่งการราชการ</option>
                  <option value="งานตามภารกิจประจำ">งานตามภารกิจประจำ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เลขที่อ้างอิงคำสั่งการ / มติ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={directiveRef}
                  onChange={(e) => setDirectiveRef(e.target.value)}
                  placeholder="เช่น คำสั่งการ ผอ. ที่ 52/2569"
                  className="w-full px-3 py-2 bg-white border border-blue-200 text-xs rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden font-semibold text-blue-900"
                />
              </div>
            </div>

            {/* REAL File Upload Input Box (อัปโหลดเอกสารจริง) */}
            <div>
              <label className="block text-xs font-bold text-blue-900 mb-1 flex items-center gap-1">
                <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                <span>แนบไฟล์เอกสารบันทึกสั่งการ (PDF, Word, Excel, รูปภาพ)</span>
              </label>
              
              {!uploadedFile ? (
                <label className="border-2 border-dashed border-blue-300 hover:border-blue-500 bg-white p-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition text-xs font-semibold text-blue-700">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>คลิกเพื่อเลือกไฟล์เอกสารบันทึกสั่งการจากคอมพิวเตอร์...</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="bg-white p-3 rounded-xl border border-blue-300 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-lg font-bold text-xs uppercase shrink-0">
                      📎 {uploadedFile.name.split('.').pop()}
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-slate-800 truncate">{uploadedFile.name}</div>
                      <div className="text-[10px] text-slate-400">
                        ขนาด: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadedFile(null)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="ลบไฟล์"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ชื่องาน / เรื่องตามคำสั่งการ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ระบุชื่องานที่ต้องการมอบหมาย..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-hidden font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              รายละเอียดงาน / ขอบเขตการทำงาน
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุรายละเอียดเพิ่มเติม..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-hidden font-normal"
            />
          </div>

          {/* Department Selection Dropdown (Read from txt file: รายชื่อหน่วยงาน69.txt) */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 relative">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                หน่วยงานผู้รับผิดชอบ (เลือกจากรายชื่อหน่วยงาน 51 แห่ง) <span className="text-red-500">*</span>
              </label>
              
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                {isAllSelected ? (
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>เลือกทุกหน่วยงาน (51)</span>
              </button>
            </div>

            {/* Selected Departments summary pill tags */}
            <div
              onClick={() => setShowDeptDropdown(!showDeptDropdown)}
              className="flex flex-wrap gap-1.5 p-2.5 bg-white rounded-xl border border-slate-200 min-h-[44px] items-center cursor-pointer hover:border-blue-400 transition"
            >
              {selectedDepts.length === DEPARTMENTS.length ? (
                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  ☑️ [ ALL ] เลือกทุกหน่วยงานทั้งหมด (51 สำนัก/กอง)
                </span>
              ) : (
                selectedDepts.map((d) => (
                  <span
                    key={d}
                    className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1"
                  >
                    <span>🏢 {d}</span>
                    {selectedDepts.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDept(d);
                        }}
                        className="hover:text-red-600 font-bold ml-1"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))
              )}

              <button
                type="button"
                className="ml-auto text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition shrink-0"
              >
                {showDeptDropdown ? '▲ ปิดดรอปดาว' : '▼ คลิกเลือกหน่วยงาน'}
              </button>
            </div>

            {/* Searchable Dropdown Overlay List with Top ALL Checkbox Row */}
            {showDeptDropdown && (
              <div className="mt-2 bg-white border border-blue-300 rounded-2xl shadow-2xl p-3 space-y-2 z-50 max-h-64 overflow-y-auto animate-in fade-in">
                
                {/* Search Bar & ALL checkbox in same header row inside dropdown */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={deptSearchText}
                      onChange={(e) => setDeptSearchText(e.target.value)}
                      placeholder="พิมพ์ค้นชื่อหน่วยงาน (เช่น สทส., สะพานปลา, สบค., ฝตน.)..."
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>

                  {/* Top ALL Checkbox button inside dropdown header */}
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
                      isAllSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                    }`}
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-white" />
                    ) : (
                      <Square className="w-4 h-4 text-amber-600" />
                    )}
                    <span>[ ALL ] เลือกทั้งหมด</span>
                  </button>
                </div>

                {/* Top explicit ALL Row inside list */}
                <div className="divide-y divide-slate-100 border-t border-slate-100 pt-1">
                  <div
                    onClick={toggleSelectAll}
                    className={`py-2.5 px-3 rounded-xl flex items-center justify-between text-xs font-extrabold cursor-pointer transition mb-1 ${
                      isAllSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      [ ALL ] เลือกทุกหน่วยงานในระบบทั้งหมด (51 แห่ง)
                    </span>
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-white" />
                    ) : (
                      <Square className="w-4 h-4 text-blue-600" />
                    )}
                  </div>

                  {filteredDepartments.map((dept) => {
                    const isChecked = selectedDepts.includes(dept);
                    return (
                      <div
                        key={dept}
                        onClick={() => toggleDept(dept)}
                        className={`py-2 px-2.5 rounded-lg flex items-center justify-between text-xs font-medium cursor-pointer transition ${
                          isChecked ? 'bg-blue-50/80 text-blue-900 font-bold' : 'text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        <span>🏢 {dept}</span>
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              รายการหน่วยงานอ่านจากไฟล์ <strong>"รายชื่อหน่วยงาน69.txt"</strong> รวม 51 สำนัก/กอง
            </p>
          </div>

          {/* ช่องพิมพ์ชื่อผู้รับผิดชอบโดยตรง (เมื่อรับการสั่งการจากผู้บริหารมา) */}
          <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>ชื่อผู้รับผิดชอบ (ระบุโดยตรงตามข้อสั่งการผู้บริหาร)</span>
              </span>
              <span className="text-slate-400 font-normal text-[11px]">(ระบุเฉพาะบุคคล หรือเว้นว่างให้หน่วยงานมอบหมาย)</span>
            </label>
            <input
              type="text"
              value={assigneeName}
              onChange={(e) => setAssigneeName(e.target.value)}
              placeholder="พิมพ์ชื่อ-นามสกุล ผู้รับผิดชอบ (เช่น สมชาย ใจดี, นภา สายชล...) หรือเว้นว่างไว้"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-blue-500 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 outline-hidden transition shadow-2xs placeholder-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                วันที่รับงาน / สั่งการ
              </label>
              <input
                type="date"
                required
                value={dateReceived}
                onChange={(e) => setDateReceived(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                กำหนดส่ง (Deadline) <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ระดับความเร่งด่วน
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden font-medium cursor-pointer"
              >
                <option value="ปกติ">ปกติ</option>
                <option value="เร่งด่วน">เร่งด่วน</option>
                <option value="เร่งด่วนมาก">เร่งด่วนมาก</option>
              </select>
            </div>
          </div>

          {/* Email Notification Option */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="text-emerald-900">
                <span className="font-bold">ส่งอีเมลแจ้งเตือนไปยังหัวหน้าหน่วยงานที่ต้องดำเนินการ ({selectedDepts.length} หน่วยงาน)</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={sendEmailAlert}
              onChange={(e) => setSendEmailAlert(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
            />
          </div>

        </form>

        {/* Sticky Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <Mail className="w-4 h-4" />
            <span>บันทึกสั่งการถึง {selectedDepts.length} หน่วยงาน</span>
          </button>
        </div>

      </div>
    </div>
  );
};
