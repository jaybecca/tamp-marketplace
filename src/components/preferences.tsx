'use client';

import { useEffect, useState } from 'react';

export const languageOptions = [
  ['en', 'English'], ['fr', 'Français'], ['ar', 'العربية'], ['sw', 'Kiswahili'], ['pt', 'Português'], ['zu', 'isiZulu']
] as const;

export const currencyOptions = [
  ['NGN', 'Nigerian Naira', '₦'], ['GHS', 'Ghanaian Cedi', 'GH₵'], ['KES', 'Kenyan Shilling', 'KSh'], ['UGX', 'Ugandan Shilling', 'USh'],
  ['ZAR', 'South African Rand', 'R'], ['TZS', 'Tanzanian Shilling', 'TSh'], ['RWF', 'Rwandan Franc', 'RF'], ['ETB', 'Ethiopian Birr', 'Br'], ['ZMW', 'Zambian Kwacha', 'ZK'], ['BWP', 'Botswana Pula', 'P'], ['MZN', 'Mozambican Metical', 'MT'], ['AOA', 'Angolan Kwanza', 'Kz'], ['CDF', 'Congolese Franc', 'FC'], ['XAF', 'Central African CFA franc', 'CFA'], ['DZD', 'Algerian Dinar', 'دج'], ['TND', 'Tunisian Dinar', 'د.ت'],
  ['EGP', 'Egyptian Pound', 'E£'], ['MAD', 'Moroccan Dirham', 'MAD'], ['XOF', 'West African CFA franc', 'CFA'], ['GMD', 'Gambian Dalasi', 'D'], ['SLE', 'Sierra Leonean Leone', 'Le'], ['MWK', 'Malawian Kwacha', 'MK'], ['MGA', 'Malagasy Ariary', 'Ar'], ['BIF', 'Burundian Franc', 'FBu'], ['MUR', 'Mauritian Rupee', '₨'], ['USD', 'US Dollar', '$'], ['EUR', 'Euro', '€'], ['GBP', 'British Pound', '£']
] as const;

const currencyLabels: Record<string, Record<string,string>> = {
  en: {USD:'US Dollar',EUR:'Euro',GBP:'British Pound',NGN:'Nigerian Naira',GHS:'Ghanaian Cedi',KES:'Kenyan Shilling',UGX:'Ugandan Shilling',EGP:'Egyptian Pound',MAD:'Moroccan Dirham',XOF:'West African CFA franc'},
  fr: {USD:'Dollar américain',EUR:'Euro',GBP:'Livre sterling',NGN:'Naira nigérian',GHS:'Cedi ghanéen',KES:'Shilling kényan',UGX:'Shilling ougandais',EGP:'Livre égyptienne',MAD:'Dirham marocain',XOF:'Franc CFA ouest-africain'},
  ar: {USD:'الدولار الأمريكي',EUR:'اليورو',GBP:'الجنيه الإسترليني',NGN:'النايرا النيجيرية',GHS:'السيدي الغاني',KES:'الشلن الكيني',UGX:'الشلن الأوغندي',EGP:'الجنيه المصري',MAD:'الدرهم المغربي',XOF:'فرنك غرب أفريقيا'},
  sw: {USD:'Dola ya Marekani',EUR:'Euro',GBP:'Pauni ya Uingereza',NGN:'Naira ya Nigeria',GHS:'Sedi ya Ghana',KES:'Shilingi ya Kenya',UGX:'Shilingi ya Uganda',EGP:'Pauni ya Misri',MAD:'Dirham ya Morocco',XOF:'Faranga ya CFA ya Afrika Magharibi'}
};

export function PreferencesBar() {
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('USD');
  const currencyLanguage = currencyLabels[language] || currencyLabels.en;

  useEffect(() => {
    const savedLanguage = localStorage.getItem('tamp-language') || 'en';
    const savedCurrency = localStorage.getItem('tamp-currency') || 'USD';
    setLanguage(savedLanguage);
    setCurrency(savedCurrency);
    document.documentElement.lang = savedLanguage;
    document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
  }, []);

  function changeLanguage(value: string) {
    setLanguage(value);
    localStorage.setItem('tamp-language', value);
    window.dispatchEvent(new Event('tamp-preferences'));
    document.documentElement.lang = value;
    document.documentElement.dir = value === 'ar' ? 'rtl' : 'ltr';
  }

  function changeCurrency(value: string) {
    setCurrency(value);
    localStorage.setItem('tamp-currency', value);
    window.dispatchEvent(new Event('tamp-preferences'));
  }

  return <div className="preference-controls" aria-label="Shopping preferences">
    <label><span>🌐</span><select aria-label="Language" value={language} onChange={e => changeLanguage(e.target.value)}>{languageOptions.map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select></label>
    <span className="preference-divider">|</span>
    <label><span>◉</span><select aria-label="Currency" value={currency} onChange={e => changeCurrency(e.target.value)}>{currencyOptions.map(([code, label, symbol]) => <option key={code} value={code}>{code} — {currencyLanguage[code] || label} ({symbol})</option>)}</select></label>
  </div>;
}

export function AuthHeader() {
  return <header className="auth-header">
    <a className="auth-brand" href="/"><img src="/tamp-logo.webp" alt="TAMP" /></a>
    <div className="auth-header-right"><PreferencesBar /><a className="auth-back" href="/">← Back to marketplace</a></div>
  </header>;
}

export function PasswordField({ name = 'password', autoComplete, placeholder, required }: { name?: string; autoComplete?: string; placeholder: string; required?: boolean }) {
  const [visible, setVisible] = useState(false);
  return <div className="password-field">
    <input name={name} type={visible ? 'text' : 'password'} autoComplete={autoComplete} placeholder={placeholder} required={required} />
    <button type="button" className="password-toggle" onClick={() => setVisible(v => !v)} aria-label={visible ? 'Hide password' : 'Show password'}>{visible ? 'Hide' : 'Show'}</button>
  </div>;
}
