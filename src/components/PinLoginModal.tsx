import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { TaskStore } from '../services/store';
import { getAvatarByPrefix } from '../utils/avatars';
import { UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PinLoginModalProps {
  onSuccess: (user: User) => void;
}

export const PinLoginModal: React.FC<PinLoginModalProps> = ({ onSuccess }) => {
  const users = TaskStore.getUsers();

  // 1. ผู้บริหาร (Executive) - ลำดับแรก
  const execUsers = users.filter(u => u.role === 'executive');

  // 2. สำนักงานเลขานุการผู้อำนวยการ (สลข.ผอ.) - ลำดับที่สอง โดยมี น.ส.กนกกร ศิลา เป็นลำดับแรก
  const secUserOrder = ['USR-SEC-01', 'USR-010', 'USR-SEC-02', 'USR-SEC-03', 'USR-SEC-04'];
  const secUsers = users
    .filter(u => u.role === 'secretary')
    .sort((a, b) => {
      const idxA = secUserOrder.indexOf(a.id);
      const idxB = secUserOrder.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });

  // 3. ผู้ดูแลระบบ (Admin) - ลำดับที่สาม
  const adminUsers = users.filter(u => u.role === 'admin');

  // Default to first executive (นายปรีดา ยังสุขสถาพร)
  const defaultUser = execUsers[0] || secUsers[0] || users[0];
  const [selectedUserId, setSelectedUserId] = useState<string>(defaultUser.id);
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const selectedUser = users.find(u => u.id === selectedUserId) || defaultUser;

  // Max PIN length is 8 digits
  const maxPinLength = 8;

  const handleDigitPress = (digit: string) => {
    if (pin.length >= maxPinLength) return;
    setErrorMsg('');
    const nextPin = pin + digit;
    setPin(nextPin);
    checkPin(nextPin);
  };

  const handleDelete = () => {
    setErrorMsg('');
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setErrorMsg('');
    setPin('');
  };

  const checkPin = (pinToTest: string) => {
    // Check if entered pin reaches 7 or 8 digits
    if (pinToTest.length >= 7) {
      const result = TaskStore.verifyPin(pinToTest, selectedUserId);
      if (result.success && result.user) {
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess(result.user!);
        }, 350);
        return;
      }
    }
    if (pinToTest.length >= maxPinLength) {
      triggerError('รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
    }
  };

  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
      setPin('');
    }, 700);
  };

  // Keyboard support for typing numbers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigitPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, selectedUserId]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
      
      {/* Centered PIN Card: reduced to ~1/3 screen size */}
      <div 
        className={`bg-white rounded-2xl shadow-xl border border-slate-200/90 w-full max-w-[325px] overflow-hidden transform transition-all duration-300 ${
          isShaking ? 'animate-bounce' : ''
        }`}
      >
        
        {/* Header - Compact */}
        <div className="pt-3.5 pb-1 px-4 text-center">
          <div className="w-8 h-8 mx-auto mb-1 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 text-white flex items-center justify-center text-base shadow-xs ring-2 ring-amber-100">
            🔒
          </div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center justify-center gap-1">
            <span>เข้าสู่ระบบยืนยันตัวตน</span>
          </h2>
          <p className="text-[10px] text-slate-500">
            กรอก PIN เพื่อยืนยันตัวตนเข้าใช้งานระบบ
          </p>
        </div>

        {/* User Profile Selector: 1. Executive, 2. Secretariat, 3. Admin */}
        <div className="px-4 pb-1">
          <label className="block text-[10px] font-bold text-slate-600 mb-0.5 text-left flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-blue-600" />
            <span>เลือกผู้ใช้งาน:</span>
          </label>
          <select
            value={selectedUserId}
            onChange={(e) => {
              setSelectedUserId(e.target.value);
              setPin('');
              setErrorMsg('');
            }}
            className="w-full px-2 py-1 bg-slate-50 border border-slate-300 focus:border-blue-500 rounded-lg text-xs font-semibold text-slate-800 shadow-2xs outline-hidden cursor-pointer"
          >
            {/* 1. ผู้บริหาร (Executive) - ลำดับแรก */}
            <optgroup label="ผู้บริหาร (Executive)">
              {execUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  💼 {u.name}
                </option>
              ))}
            </optgroup>

            {/* 2. สำนักงานเลขานุการผู้อำนวยการ (สลข.ผอ.) - ลำดับที่สอง (กนกกร ลำดับแรก) */}
            <optgroup label="สำนักงานเลขานุการผู้อำนวยการ (สลข.ผอ.)">
              {secUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  📝 {u.name}
                </option>
              ))}
            </optgroup>

            {/* 3. ผู้ดูแลระบบ (Admin) - ลำดับที่สาม */}
            <optgroup label="ผู้ดูแลระบบ (Admin)">
              {adminUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  👑 {u.name.replace(/\s*\(ผู้ดูแลระบบ\)/g, '')}
                </option>
              ))}
            </optgroup>
          </select>

          {/* Selected User Badge - Compact */}
          <div className="mt-1.5 flex items-center gap-2 p-1.5 bg-blue-50/70 border border-blue-200/60 rounded-lg shadow-2xs">
            <img
              src={selectedUser.avatar || getAvatarByPrefix(selectedUser.name, selectedUser.role, selectedUser.position)}
              alt={selectedUser.name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-blue-500/30 shrink-0"
            />
            <div className="text-left min-w-0 flex-1">
              <div className="text-xs font-bold text-blue-900 truncate">{selectedUser.name}</div>
              <div className="text-[9px] text-blue-700 truncate">{selectedUser.position}</div>
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 shrink-0">
              {selectedUser.role === 'admin' ? 'Admin' : selectedUser.role === 'executive' ? 'ผู้บริหาร' : 'สลข.ผอ.'}
            </span>
          </div>
        </div>

        {/* PIN Circles (Compact) */}
        <div className="py-1 px-4 flex flex-col items-center justify-center">
          <div className="flex items-center gap-1.5 mb-1">
            {Array.from({ length: maxPinLength }).map((_, idx) => {
              const isFilled = idx < pin.length;
              return (
                <span
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-full border transition-all duration-150 ${
                    isSuccess
                      ? 'bg-emerald-500 border-emerald-500 scale-110'
                      : isFilled
                      ? 'bg-blue-600 border-blue-600 scale-105 shadow-2xs'
                      : 'border-slate-300 bg-white'
                  }`}
                />
              );
            })}
          </div>

          {errorMsg ? (
            <p className="text-[10px] font-bold text-red-600 flex items-center gap-1 animate-pulse">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{errorMsg}</span>
            </p>
          ) : isSuccess ? (
            <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              <span>รหัสถูกต้อง กำลังเข้าสู่ระบบ...</span>
            </p>
          ) : (
            <p className="text-[10px] text-slate-400">
              {pin.length === 0 ? 'กดแป้นตัวเลขเพื่อระบุ PIN' : `กรอกแล้ว ${pin.length} / 8 หลัก`}
            </p>
          )}
        </div>

        {/* Number Keypad Layout - Compact */}
        <div className="px-4 pb-3">
          <div className="grid grid-cols-3 gap-1.5">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleDigitPress(digit)}
                disabled={isSuccess}
                className="py-1.5 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200/90 rounded-xl text-base font-bold text-slate-800 shadow-2xs hover:shadow-xs transition transform active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {digit}
              </button>
            ))}

            {/* Bottom Row: [ลบ] [0] [ยกเลิก] */}
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSuccess || pin.length === 0}
              className="py-1.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition transform active:scale-95 cursor-pointer disabled:opacity-40"
            >
              ลบ
            </button>

            <button
              type="button"
              onClick={() => handleDigitPress('0')}
              disabled={isSuccess}
              className="py-1.5 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200/90 rounded-xl text-base font-bold text-slate-800 shadow-2xs hover:shadow-xs transition transform active:scale-95 cursor-pointer disabled:opacity-50"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={isSuccess || pin.length === 0}
              className="py-1.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-red-600 transition transform active:scale-95 cursor-pointer disabled:opacity-40"
            >
              ยกเลิก
            </button>
          </div>

          {/* Quick Guide Footer - Compact */}
          <div className="mt-2 pt-1.5 border-t border-slate-100 text-[9px] text-slate-400 space-y-0.5">
            <div>💼 <strong>ผู้บริหาร:</strong> ผอ. <code>1111111</code> • รผอ. <code>07170184 / 07170185 / 07170006</code></div>
            <div>🔑 <strong>สลข.ผอ.:</strong> กนกกร <code>07170176</code> • กันยาวีย์ <code>07170088</code></div>
            <div>👑 <strong>Admin:</strong> <code>21212496</code></div>
          </div>
        </div>

      </div>

    </div>
  );
};
