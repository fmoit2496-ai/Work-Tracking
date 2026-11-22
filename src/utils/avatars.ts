// SVG Avatar Generator based on Thai Name Prefixes (คำนำหน้าชื่อ) & Roles

const toSvgDataUri = (svgString: string): string => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
};

/**
 * 1. อวตารหญิง: เลขาหน้าห้อง / เจ้าหน้าที่หญิง (น.ส.กันยาวีร์, น.ส.กนกกร, น.ส.ทิพาพร, น.ส.ภาณุมาศ, น.ส.นภา, น.ส.ชลทิพย์)
 * โทนสีฟ้า/น้ำเงินพาสเทล ผมประบ่าเรียบร้อย ยิ้มสุภาพ สวมเสื้อเชิ้ตขาวสูท/คาร์ดิแกน
 */
export const AVATAR_FEMALE_SECRETARY = toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="bg_fsec" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E0F2FE" />
      <stop offset="100%" stop-color="#BAE6FD" />
    </linearGradient>
    <linearGradient id="hair_fsec" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#331D12" />
      <stop offset="100%" stop-color="#1E130D" />
    </linearGradient>
    <linearGradient id="suit_fsec" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563EB" />
      <stop offset="100%" stop-color="#1D4ED8" />
    </linearGradient>
    <clipPath id="circle_fsec">
      <circle cx="60" cy="60" r="58" />
    </clipPath>
  </defs>
  <circle cx="60" cy="60" r="58" fill="url(#bg_fsec)" stroke="#93C5FD" stroke-width="3" />
  <g clip-path="url(#circle_fsec)">
    <!-- Back Hair -->
    <path d="M 28 55 C 26 85 35 105 45 110 L 75 110 C 85 105 94 85 92 55 C 92 35 85 24 60 24 C 35 24 28 35 28 55 Z" fill="url(#hair_fsec)" />
    
    <!-- Body & Clothes -->
    <path d="M 20 120 L 20 108 C 20 95 38 88 48 85 L 72 85 C 82 88 100 95 100 108 L 100 120 Z" fill="url(#suit_fsec)" />
    <!-- White Inner Collar -->
    <path d="M 48 85 L 60 105 L 72 85 Z" fill="#FFFFFF" />
    <path d="M 52 85 L 60 97 L 68 85 Z" fill="#F8FAFC" />
    
    <!-- Neck -->
    <rect x="52" y="70" width="16" height="20" rx="6" fill="#FCD9B8" />
    
    <!-- Head / Face -->
    <ellipse cx="60" cy="58" rx="22" ry="24" fill="#FCD9B8" />
    
    <!-- Blush -->
    <ellipse cx="44" cy="64" rx="4.5" ry="2.5" fill="#F87171" opacity="0.35" />
    <ellipse cx="76" cy="64" rx="4.5" ry="2.5" fill="#F87171" opacity="0.35" />
    
    <!-- Front Hair / Bangs -->
    <path d="M 37 48 C 42 36 50 32 60 32 C 70 32 78 36 83 48 C 85 53 82 58 79 50 C 72 40 68 40 60 43 C 52 40 48 40 41 50 C 38 58 35 53 37 48 Z" fill="url(#hair_fsec)" />
    <path d="M 38 50 C 34 56 36 68 38 72 C 39 74 41 71 40 66 C 39 62 40 56 42 52 Z" fill="url(#hair_fsec)" />
    <path d="M 82 50 C 86 56 84 68 82 72 C 81 74 79 71 80 66 C 81 62 80 56 78 52 Z" fill="url(#hair_fsec)" />

    <!-- Cute Eyes -->
    <circle cx="49" cy="56" r="3" fill="#1E293B" />
    <circle cx="50" cy="55" r="1" fill="#FFFFFF" />
    <circle cx="71" cy="56" r="3" fill="#1E293B" />
    <circle cx="72" cy="55" r="1" fill="#FFFFFF" />

    <!-- Eyebrows -->
    <path d="M 45 50 Q 49 48 53 50" stroke="#331D12" stroke-width="1.8" fill="none" stroke-linecap="round" />
    <path d="M 67 50 Q 71 48 75 50" stroke="#331D12" stroke-width="1.8" fill="none" stroke-linecap="round" />

    <!-- Smile -->
    <path d="M 54 67 Q 60 72 66 67" stroke="#E11D48" stroke-width="2" fill="none" stroke-linecap="round" />
    
    <!-- Small Pearl Earrings -->
    <circle cx="37" cy="62" r="2" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="0.5" />
    <circle cx="83" cy="62" r="2" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="0.5" />
  </g>
</svg>
`);

/**
 * 2. อวตารชาย: เจ้าหน้าที่ชาย / นายเจษฎา ศรีเทพ, นายวิชัย, นายปิติ, นายอนันต์, นายสุรชัย
 * เสื้อเชิ้ตฟ้า ผูกเนกไทสีกรมท่า ผมสั้นสุภาพ สมาร์ท คล่องแคล่ว
 */
export const AVATAR_MALE_OFFICER = toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="bg_moff" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EFF6FF" />
      <stop offset="100%" stop-color="#DBEAFE" />
    </linearGradient>
    <linearGradient id="hair_moff" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E293B" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>
    <clipPath id="circle_moff">
      <circle cx="60" cy="60" r="58" />
    </clipPath>
  </defs>
  <circle cx="60" cy="60" r="58" fill="url(#bg_moff)" stroke="#93C5FD" stroke-width="3" />
  <g clip-path="url(#circle_moff)">
    <!-- Clothes: Light blue shirt -->
    <path d="M 20 120 L 20 108 C 20 95 36 88 48 85 L 72 85 C 84 88 100 95 100 108 L 100 120 Z" fill="#3B82F6" />
    
    <!-- White Collar -->
    <path d="M 46 84 L 56 98 L 60 92 L 64 98 L 74 84 Z" fill="#FFFFFF" />
    
    <!-- Navy Tie -->
    <path d="M 57 92 L 63 92 L 64 98 L 60 100 L 56 98 Z" fill="#1E3A8A" />
    <path d="M 57 98 L 63 98 L 65 118 L 60 122 L 55 118 Z" fill="#1E3A8A" />

    <!-- Neck -->
    <rect x="52" y="70" width="16" height="20" rx="6" fill="#FCD9B8" />

    <!-- Ears -->
    <circle cx="37" cy="60" r="5" fill="#FCD9B8" />
    <circle cx="83" cy="60" r="5" fill="#FCD9B8" />

    <!-- Head / Face -->
    <ellipse cx="60" cy="58" rx="22" ry="24" fill="#FCD9B8" />

    <!-- Male Hair -->
    <path d="M 36 50 C 35 34 45 23 60 23 C 75 23 85 34 84 50 C 80 44 74 41 68 41 C 58 41 50 45 36 50 Z" fill="url(#hair_moff)" />
    <!-- Sideburns -->
    <path d="M 36 48 L 38 60 L 41 58 L 40 48 Z" fill="url(#hair_moff)" />
    <path d="M 84 48 L 82 60 L 79 58 L 80 48 Z" fill="url(#hair_moff)" />

    <!-- Eyes -->
    <circle cx="49" cy="57" r="3" fill="#0F172A" />
    <circle cx="50" cy="56" r="1" fill="#FFFFFF" />
    <circle cx="71" cy="57" r="3" fill="#0F172A" />
    <circle cx="72" cy="56" r="1" fill="#FFFFFF" />

    <!-- Eyebrows -->
    <path d="M 44 50 Q 50 48 55 51" stroke="#0F172A" stroke-width="2.2" fill="none" stroke-linecap="round" />
    <path d="M 65 51 Q 70 48 76 50" stroke="#0F172A" stroke-width="2.2" fill="none" stroke-linecap="round" />

    <!-- Nose & Smile -->
    <path d="M 60 60 L 59 64 L 62 64" stroke="#D97706" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.6" />
    <path d="M 54 69 Q 60 74 66 69" stroke="#9A3412" stroke-width="2" fill="none" stroke-linecap="round" />
  </g>
</svg>
`);

/**
 * 3. อวตารผู้บริหารชาย: ผอ. นายปรีดา ยังสุขสถาพร / รผอ.บร. นายศุภชาติ ชาสมบัติ
 * สูทสีกรมท่าเข้ม พรีเมียม เนกไทแดงเลือดหมู/ทอง พร้อมเข็มกลัดเกียรติยศ ผู้นำองค์กร
 */
export const AVATAR_MALE_EXECUTIVE = toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="bg_mexec" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EFF6FF" />
      <stop offset="100%" stop-color="#BFDBFE" />
    </linearGradient>
    <linearGradient id="suit_mexec" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E293B" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>
    <clipPath id="circle_mexec">
      <circle cx="60" cy="60" r="58" />
    </clipPath>
  </defs>
  <circle cx="60" cy="60" r="58" fill="url(#bg_mexec)" stroke="#F59E0B" stroke-width="3.5" />
  <g clip-path="url(#circle_mexec)">
    <!-- Suit Jacket -->
    <path d="M 16 120 L 16 106 C 16 92 34 85 48 83 L 72 83 C 86 85 104 92 104 106 L 104 120 Z" fill="url(#suit_mexec)" />
    
    <!-- White Shirt -->
    <path d="M 48 83 L 60 108 L 72 83 Z" fill="#FFFFFF" />
    
    <!-- Burgundy Tie with Gold Line -->
    <path d="M 57 88 L 63 88 L 64 96 L 60 98 L 56 96 Z" fill="#991B1B" />
    <path d="M 57 96 L 63 96 L 65 120 L 60 122 L 55 120 Z" fill="#991B1B" />
    <line x1="58" y1="104" x2="62" y2="104" stroke="#F59E0B" stroke-width="1.5" />

    <!-- Lapels -->
    <path d="M 38 85 L 52 108 L 48 120 L 28 120 Z" fill="#0F172A" />
    <path d="M 82 85 L 68 108 L 72 120 L 92 120 Z" fill="#0F172A" />

    <!-- Gold Lapel Pin -->
    <circle cx="42" cy="98" r="2.5" fill="#F59E0B" stroke="#D97706" stroke-width="0.5" />

    <!-- Neck -->
    <rect x="52" y="68" width="16" height="20" rx="6" fill="#FCD9B8" />

    <!-- Ears -->
    <circle cx="36" cy="58" r="5" fill="#FCD9B8" />
    <circle cx="84" cy="58" r="5" fill="#FCD9B8" />

    <!-- Head / Face -->
    <ellipse cx="60" cy="56" rx="22" ry="24" fill="#FCD9B8" />

    <!-- Executive Hair with Subtle Distinguished Style -->
    <path d="M 35 48 C 34 32 46 21 60 21 C 74 21 86 32 85 48 C 80 41 74 38 66 38 C 55 38 46 43 35 48 Z" fill="#1E293B" />
    <path d="M 38 34 C 45 28 55 26 62 26 C 68 26 75 28 78 32 C 73 30 65 29 58 29 C 48 29 42 32 38 34 Z" fill="#64748B" opacity="0.4" />

    <!-- Sideburns -->
    <path d="M 36 46 L 38 56 L 41 54 L 40 46 Z" fill="#1E293B" />
    <path d="M 84 46 L 82 56 L 79 54 L 80 46 Z" fill="#1E293B" />

    <!-- Eyes -->
    <circle cx="49" cy="55" r="3" fill="#0F172A" />
    <circle cx="50" cy="54" r="1" fill="#FFFFFF" />
    <circle cx="71" cy="55" r="3" fill="#0F172A" />
    <circle cx="72" cy="54" r="1" fill="#FFFFFF" />

    <!-- Eyebrows -->
    <path d="M 43 48 Q 49 46 55 49" stroke="#1E293B" stroke-width="2.5" fill="none" stroke-linecap="round" />
    <path d="M 65 49 Q 71 46 77 48" stroke="#1E293B" stroke-width="2.5" fill="none" stroke-linecap="round" />

    <!-- Confident Smile -->
    <path d="M 54 67 Q 60 72 66 67" stroke="#7C2D12" stroke-width="2.2" fill="none" stroke-linecap="round" />
  </g>
</svg>
`);

/**
 * 4. อวตารผู้บริหารหญิง: รผอ.พกป. นางนิติกร ขาวดี / รผอ.สป.ทร. นางสาวปิยวรรณ แก้วกล้า
 * สูทเบลเซอร์พรีเมียมสีม่วง/มรกต สร้อยไข่มุก ทรงผมสง่างาม ภูมิฐาน
 */
export const AVATAR_FEMALE_EXECUTIVE = toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="bg_fexec" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FAF5FF" />
      <stop offset="100%" stop-color="#E9D5FF" />
    </linearGradient>
    <linearGradient id="suit_fexec" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6B21A8" />
      <stop offset="100%" stop-color="#4C1D95" />
    </linearGradient>
    <clipPath id="circle_fexec">
      <circle cx="60" cy="60" r="58" />
    </clipPath>
  </defs>
  <circle cx="60" cy="60" r="58" fill="url(#bg_fexec)" stroke="#F59E0B" stroke-width="3.5" />
  <g clip-path="url(#circle_fexec)">
    <!-- Back Hair -->
    <path d="M 28 52 C 26 80 34 100 44 108 L 76 108 C 86 100 94 80 92 52 C 92 32 85 22 60 22 C 35 22 28 32 28 52 Z" fill="#1E1B4B" />

    <!-- Executive Blazer -->
    <path d="M 18 120 L 18 106 C 18 92 36 85 48 83 L 72 83 C 84 85 102 92 102 106 L 102 120 Z" fill="url(#suit_fexec)" />
    
    <!-- Silky Ivory Inner -->
    <path d="M 48 83 L 60 106 L 72 83 Z" fill="#FFFBEB" />

    <!-- Pearl Necklace -->
    <circle cx="53" cy="88" r="2.2" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="0.5" />
    <circle cx="57" cy="90" r="2.4" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="0.5" />
    <circle cx="60" cy="91" r="2.6" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="0.5" />
    <circle cx="63" cy="90" r="2.4" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="0.5" />
    <circle cx="67" cy="88" r="2.2" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="0.5" />

    <!-- Neck -->
    <rect x="52" y="68" width="16" height="20" rx="6" fill="#FCD9B8" />

    <!-- Head / Face -->
    <ellipse cx="60" cy="56" rx="22" ry="24" fill="#FCD9B8" />
    
    <!-- Blush -->
    <ellipse cx="44" cy="62" rx="4.5" ry="2.5" fill="#F43F5E" opacity="0.3" />
    <ellipse cx="76" cy="62" rx="4.5" ry="2.5" fill="#F43F5E" opacity="0.3" />

    <!-- Front Styled Hair -->
    <path d="M 36 46 C 42 33 50 28 60 28 C 70 28 78 33 84 46 C 85 52 82 56 79 48 C 72 38 66 38 60 41 C 54 38 48 38 41 48 C 38 56 35 52 36 46 Z" fill="#1E1B4B" />

    <!-- Eyes -->
    <circle cx="49" cy="54" r="3" fill="#0F172A" />
    <circle cx="50" cy="53" r="1" fill="#FFFFFF" />
    <circle cx="71" cy="54" r="3" fill="#0F172A" />
    <circle cx="72" cy="53" r="1" fill="#FFFFFF" />

    <!-- Eyebrows -->
    <path d="M 44 48 Q 49 46 54 48" stroke="#1E1B4B" stroke-width="2" fill="none" stroke-linecap="round" />
    <path d="M 66 48 Q 71 46 76 48" stroke="#1E1B4B" stroke-width="2" fill="none" stroke-linecap="round" />

    <!-- Elegant Smile with Rose Lipstick -->
    <path d="M 54 65 Q 60 70 66 65" stroke="#BE123C" stroke-width="2.2" fill="none" stroke-linecap="round" />

    <!-- Pearl Earrings -->
    <circle cx="36" cy="59" r="2.8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="0.5" />
    <circle cx="84" cy="59" r="2.8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="0.5" />
  </g>
</svg>
`);

/**
 * 5. อวตาร Admin (Ranida.c / Natanong.s / ผู้ดูแลระบบ)
 * โทนสีทอง/เหลืองอำพัน Smart Tech Blazer พร้อมไอคอนมงกุฎและกุญแจทอง
 */
export const AVATAR_ADMIN_USER = toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="bg_adm" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF3C7" />
      <stop offset="100%" stop-color="#FDE68A" />
    </linearGradient>
    <linearGradient id="suit_adm" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E293B" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>
    <clipPath id="circle_adm">
      <circle cx="60" cy="60" r="58" />
    </clipPath>
  </defs>
  <circle cx="60" cy="60" r="58" fill="url(#bg_adm)" stroke="#F59E0B" stroke-width="3.5" />
  <g clip-path="url(#circle_adm)">
    <!-- Back Hair / Silhouette -->
    <path d="M 30 52 C 28 80 36 100 46 108 L 74 108 C 84 100 92 80 90 52 C 90 32 84 24 60 24 C 36 24 30 32 30 52 Z" fill="#0F172A" />

    <!-- Tech Blazer -->
    <path d="M 18 120 L 18 106 C 18 92 36 86 48 83 L 72 83 C 84 86 102 92 102 106 L 102 120 Z" fill="url(#suit_adm)" />
    
    <!-- Inner Shirt with Gold Admin Lanyard -->
    <path d="M 48 83 L 60 104 L 72 83 Z" fill="#F8FAFC" />
    <path d="M 55 83 L 60 110 L 65 83" stroke="#F59E0B" stroke-width="2" fill="none" />
    <!-- Admin Shield Badge -->
    <rect x="56" y="108" width="8" height="10" rx="2" fill="#F59E0B" />

    <!-- Neck -->
    <rect x="52" y="68" width="16" height="20" rx="6" fill="#FCD9B8" />

    <!-- Head / Face -->
    <ellipse cx="60" cy="56" rx="22" ry="24" fill="#FCD9B8" />

    <!-- Smart Glasses -->
    <rect x="43" y="50" width="13" height="10" rx="2.5" fill="none" stroke="#1E293B" stroke-width="1.8" />
    <rect x="64" y="50" width="13" height="10" rx="2.5" fill="none" stroke="#1E293B" stroke-width="1.8" />
    <line x1="56" y1="55" x2="64" y2="55" stroke="#1E293B" stroke-width="1.8" />

    <!-- Eyes -->
    <circle cx="49.5" cy="55" r="2.5" fill="#0F172A" />
    <circle cx="50" cy="54" r="0.8" fill="#FFFFFF" />
    <circle cx="70.5" cy="55" r="2.5" fill="#0F172A" />
    <circle cx="71" cy="54" r="0.8" fill="#FFFFFF" />

    <!-- Front Hair -->
    <path d="M 37 46 C 43 34 50 30 60 30 C 70 30 77 34 83 46 C 85 52 81 55 78 48 C 72 39 67 38 60 41 C 53 38 48 39 42 48 C 39 55 35 52 37 46 Z" fill="#0F172A" />

    <!-- Crown Accent above head -->
    <path d="M 52 26 L 55 21 L 60 25 L 65 21 L 68 26 Z" fill="#F59E0B" stroke="#D97706" stroke-width="0.8" />

    <!-- Smile -->
    <path d="M 54 67 Q 60 72 66 67" stroke="#9A3412" stroke-width="2" fill="none" stroke-linecap="round" />
  </g>
</svg>
`);

/**
 * ฟังก์ชันเลือกรูปโปรไฟล์อวตารอัตโนมัติตาม "คำนำหน้าชื่อ" และบทบาท
 * - นาย -> อวตารชาย (ผู้บริหาร หรือ เจ้าหน้าที่)
 * - นางสาว / น.ส. / นาง -> อวตารหญิง (ผู้บริหาร หรือ เลขา/เจ้าหน้าที่)
 * - Admin / Ranida / Natanong -> อวตาร Admin
 */
export function getAvatarByPrefix(name: string, role?: string, position?: string): string {
  const cleanName = (name || '').trim();
  const lowerName = cleanName.toLowerCase();
  const lowerPos = (position || '').toLowerCase();

  // 1. Admin
  if (role === 'admin' || lowerName.includes('admin') || lowerName.includes('ranida') || lowerName.includes('natanong')) {
    return AVATAR_ADMIN_USER;
  }

  // 2. ตรวจสอบผู้บริหาร (Executive / ผอ. / รผอ.)
  const isExecutive = 
    role === 'executive' || 
    cleanName.startsWith('ผอ.') || 
    cleanName.startsWith('รผอ.') || 
    cleanName.includes('(ผอ.)') || 
    cleanName.includes('(รผอ') ||
    lowerPos.includes('ผู้อำนวยการ') ||
    lowerPos.includes('รองผู้อำนวยการ');

  // 3. ตรวจสอบคำนำหน้าชื่อ (Prefix)
  // คำนำหน้าผู้ชาย: นาย, ผอ. นาย, รผอ. นาย, นายแพทย์, ดร.
  const isMale = 
    cleanName.startsWith('นาย') || 
    cleanName.includes(' นาย') || 
    cleanName.includes('นายเจษฎา') ||
    cleanName.includes('นายปรีดา') ||
    cleanName.includes('นายศุภชาติ') ||
    cleanName.includes('วิชัย') ||
    cleanName.includes('ปิติ') ||
    cleanName.includes('อนันต์') ||
    cleanName.includes('สุรชัย');

  // คำนำหน้าผู้หญิง: นางสาว, น.ส., นาง
  const isFemale = 
    cleanName.startsWith('นางสาว') || 
    cleanName.startsWith('น.ส.') || 
    cleanName.startsWith('นาง') || 
    cleanName.includes(' นาง') ||
    cleanName.includes(' น.ส.') ||
    cleanName.includes(' นางสาว') ||
    cleanName.includes('กันยาวีร์') ||
    cleanName.includes('กันยาวีย์') ||
    cleanName.includes('กนกกร') ||
    cleanName.includes('ทิพาพร') ||
    cleanName.includes('ภาณุมาศ') ||
    cleanName.includes('นิติกร') ||
    cleanName.includes('ปิยวรรณ') ||
    cleanName.includes('นภา') ||
    cleanName.includes('กมลรัตน์') ||
    cleanName.includes('ชลทิพย์') ||
    cleanName.includes('สมศรี');

  if (isExecutive) {
    if (isMale) return AVATAR_MALE_EXECUTIVE;
    if (isFemale) return AVATAR_FEMALE_EXECUTIVE;
    return AVATAR_MALE_EXECUTIVE;
  }

  if (isMale) {
    return AVATAR_MALE_OFFICER;
  }

  if (isFemale) {
    return AVATAR_FEMALE_SECRETARY;
  }

  // ค่าเริ่มต้นถ้าไม่ระบุคำนำหน้าชัดเจน
  if (role === 'secretary') return AVATAR_FEMALE_SECRETARY;
  return AVATAR_MALE_OFFICER;
}
